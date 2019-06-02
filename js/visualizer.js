"use strict";
class Visualizer {
    constructor(canvas, cssClassName, deep) {
        this.input_manager = new InputManager();
        this.camera = new THREE.PerspectiveCamera(45, 1.0);
        this.strobe = new THREE.PointLight(0xffffff);
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, });
        this.scene = new THREE.Scene();
        this.objects = new Objects();
        this.center = new THREE.Vector3();
        this.selection_box = new SelectionBox(this.camera, this.scene, deep);
        this.selection_box_helper = new SelectionHelper(this.selection_box, this.renderer, cssClassName);
        this.selected_atoms = [];
        this.intersection = new Intersection();
        this.rotation = new Rotation();
        this.onresize();
    }
    clear() {
        this.objects.clear();
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
    }
    set_input(input) {
        this.clear();
        this.input_manager.frame = 0;
        this.input_manager.input = input;
        this.prepare_objects();
        this.prepare_scene();
        this.objects.center(this.selected_atoms, this.center);
    }
    sync_input_to_objects() {
        for (let i = 0; i < this.input_manager.atoms.length; i += 1) {
            this.objects.atoms[i].position.copy(array_to_vector(this.input_manager.atoms[i].r));
        }
        if (this.input_manager.cell) {
            for (const arrow of build_cell(this.input_manager.cell, [0x0000ff, 0x00ff00, 0xff0000], 0.05, 0.05)) {
                this.objects.cells.push(arrow);
            }
        }
    }
    sync_objects_to_input(selected) {
        for (const i of selected) {
            this.input_manager.atoms[i].r = vector_to_array(this.objects.atoms[i].position);
        }
    }
    prepare_objects() {
        for (const atom of this.input_manager.atoms) {
            const color = this.input_manager.input.element[atom.n].color;
            const radius = this.input_manager.input.element[atom.n].radius;
            const r = atom.r;
            this.objects.add_atom(radius, color, r[0], r[1], r[2]);
        }
        if (this.input_manager.cell) {
            for (const arrow of build_cell(this.input_manager.cell, [0x0000ff, 0x00ff00, 0xff0000], 0.05, 0.05)) {
                this.objects.cells.push(arrow);
            }
        }
    }
    prepare_scene() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        for (const mesh of this.objects.objects) {
            this.scene.add(mesh);
        }
        if (this.objects.cells) {
            for (const c of this.objects.cells) {
                this.scene.add(c);
            }
        }
        this.scene.add(this.strobe);
    }
    render() {
        this.strobe.position.copy(this.camera.position);
        this.strobe.quaternion.copy(this.camera.quaternion);
        this.intersection.set_plane(this.camera, this.center);
        this.renderer.render(this.scene, this.camera);
    }
    onresize() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }
    rotate_camera(mouse) {
        this.rotation.set_from_delta_camera(mouse.delta, this.camera.quaternion);
        this.rotation.apply_rotation(this.center, [this.camera], [0]);
    }
    rotate_atoms(mouse) {
        this.rotation.set_from_delta_camera(mouse.delta, this.camera.quaternion);
        this.rotation.inverse();
        for (const i of this.selected_atoms) {
            this.rotation.apply_rotation(this.center, this.objects.atoms, this.selected_atoms);
            this.input_manager.atoms[i].r = vector_to_array(this.objects.atoms[i].position);
        }
    }
    grabable(mouse) {
        if (this.intersection.intersect_objects(mouse, this.camera, this.objects.atoms).length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    translate_atoms(mouse) {
        const now = this.intersection.get_intersection(mouse.new, this.camera).clone();
        const old = this.intersection.get_intersection(mouse.old, this.camera).clone();
        const delta = now.clone().sub(old);
        for (const i of this.selected_atoms) {
            this.objects.atoms[i].position.add(delta);
            this.input_manager.atoms[i].r = vector_to_array(this.objects.atoms[i].position);
        }
    }
    translate_camera(mouse) {
        this.intersection.set_plane(this.camera, this.center);
        const now = this.intersection.get_intersection(mouse.new, this.camera).clone();
        const old = this.intersection.get_intersection(mouse.old, this.camera).clone();
        const delta = old.clone().sub(now);
        this.camera.position.add(delta);
    }
    zoom(delta) {
        let alpha = 1.0;
        let v = new THREE.Vector3(0.0, 0.0, delta * alpha);
        v.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(v);
    }
    open_selection(event, mouse) {
        this.selection_box_helper.selectStart(event);
        this.selection_box.startPoint.set(mouse.x, mouse.y, 0.5);
    }
    move_selection(event, mouse) {
        for (const item of this.selection_box.collection) {
            set_emissive(item.material, 0x000000);
        }
        this.selection_box_helper.selectMove(event);
        this.selection_box.endPoint.set(mouse.x, mouse.y, 0.5);
        this.objects.set_emissive(this.selected_atoms, 0x0000ff);
        for (const selected of this.selection_box.select()) {
            set_emissive(selected.material, 0x0000ff);
        }
    }
    over_selection(event, mouse) {
        this.selection_box_helper.selectOver(event);
        this.selection_box.endPoint.set(mouse.x, mouse.y, 0.5);
        for (const selected of this.selection_box.select()) {
            const i = this.objects.atom_number(selected);
            if (i >= 0 && this.selected_atoms.indexOf(i) == -1) {
                this.selected_atoms.push(i);
            }
        }
        this.objects.center(this.selected_atoms, this.center);
        this.selection_box.collection = [];
        this.objects.set_emissive(this.selected_atoms, 0x0000ff);
    }
    single_selection(_, mouse) {
        const intersects = this.intersection.intersect_objects(mouse, this.camera, this.objects.atoms);
        if (intersects.length == 0) {
            clear(this.selected_atoms);
        }
        else {
            const i = this.objects.atom_number(intersects[0].object);
            const idx = this.selected_atoms.indexOf(i);
            if (idx == -1) {
                this.selected_atoms.push(i);
            }
            else {
                this.selected_atoms.splice(idx);
            }
        }
        this.objects.set_emissive(this.selected_atoms, 0x0000ff);
        this.objects.center(this.selected_atoms, this.center);
    }
    next() {
        this.input_manager.next();
        this.sync_input_to_objects();
    }
    prev() {
        this.input_manager.prev();
        this.sync_input_to_objects();
    }
}
//# sourceMappingURL=visualizer.js.map