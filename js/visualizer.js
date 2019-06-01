"use strict";
const mode = {
    normal: 0,
    select: 1,
    rotate_camera: 2,
    translate_camera: 3,
    rotate_atoms: 4,
    translate_atoms: 5,
};
function array_to_vector(array) {
    return new THREE.Vector3(array[0], array[1], array[2]);
}
function vector_to_array(vector) {
    return [vector.x, vector.y, vector.z];
}
function clear(array) {
    while (array.length > 0) {
        array.pop();
    }
}
class Visualizer {
    constructor(canvas, cssClassName, deep) {
        this.camera = new THREE.PerspectiveCamera(45, 1.0);
        this.strobe = new THREE.PointLight(0xffffff);
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, });
        this.scene = new THREE.Scene();
        this.objects = new Objects();
        this.look = new THREE.Vector3(0.0, 0.0, -1);
        this.center = new THREE.Vector3();
        this.input_manager = new InputManager();
        this.selection_box = new SelectionBox(this.camera, this.scene, deep);
        this.selection_box_helper = new SelectionHelper(this.selection_box, this.renderer, cssClassName);
        this.selected_atoms = [];
        this.intersection = new Intersection();
        this.translate_center = new THREE.Vector3();
        this.translate_camera_init = new THREE.Vector3();
    }
    get input() {
        return this.input_manager.input;
    }
    set input(input) {
        this.input_manager.frame = 0;
        this.input_manager.input = input;
        this.prepare_objects();
        this.prepare_scene();
        this.objects.center(this.selected_atoms, this.center);
        this.look.copy(this.center).sub(this.camera.position);
    }
    prepare_objects() {
        for (const atom of this.input_manager.atoms) {
            const color = this.input_manager.input.element[atom.n].color;
            const radius = this.input_manager.input.element[atom.n].radius;
            const r = atom.r;
            this.objects.add_atom(radius, color, r[0], r[1], r[2]);
        }
    }
    prepare_scene() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        for (const mesh of this.objects.objects) {
            this.scene.add(mesh);
        }
        this.scene.add(this.strobe);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    onresize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        if (this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }
    rotate_camera(mouse) {
        const delta = mouse.delta;
        const length = delta.length();
        delta.normalize();
        let angle = 2 * Math.PI * length;
        let quaternion = new THREE.Quaternion(delta.y * Math.sin(angle / 2), -delta.x * Math.sin(angle / 2), 0.0, Math.cos(angle / 2));
        let quaternion_camera = this.camera.quaternion.clone();
        quaternion.normalize();
        quaternion_camera.normalize();
        let quaternion_camera_inverse = quaternion_camera.clone().inverse();
        let rot = quaternion_camera.multiply(quaternion).multiply(quaternion_camera_inverse);
        this.camera.applyQuaternion(rot);
        this.camera.position.add(this.look);
        this.look.applyQuaternion(rot);
        this.camera.position.sub(this.look);
        this.strobe.position.copy(this.camera.position);
        this.strobe.quaternion.copy(this.camera.quaternion);
    }
    rotate_atoms(mouse) {
        const delta = mouse.delta;
        const length = delta.length();
        delta.normalize();
        let angle = 2 * Math.PI * length;
        let quaternion = new THREE.Quaternion(delta.y * Math.sin(angle / 2), -delta.x * Math.sin(angle / 2), 0.0, Math.cos(angle / 2));
        let quaternion_camera = this.camera.quaternion.clone();
        quaternion.normalize();
        quaternion_camera.normalize();
        let quaternion_camera_inverse = quaternion_camera.clone().inverse();
        let rot = quaternion_camera.multiply(quaternion).multiply(quaternion_camera_inverse);
        for (const i of this.selected_atoms) {
            const v1 = this.center.clone().sub(this.objects.atoms[i].position);
            const v2 = v1.clone().applyQuaternion(rot);
            this.objects.atoms[i].position.sub(v1).add(v2);
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
    translate(delta) {
        let alpha = 1;
        let v = new THREE.Vector3(-delta.x * alpha, -delta.y * alpha, 0.0);
        v.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(v);
        this.strobe.position.copy(this.camera.position);
        this.strobe.quaternion.copy(this.camera.quaternion);
    }
    start_translate(mouse) {
        this.intersection.set_plane(this.camera, this.center);
        this.translate_center.copy(this.intersection.get_intersection(mouse.new, this.camera));
        this.translate_camera_init.copy(this.camera.position);
    }
    translate_atoms(mouse) {
        const current = this.intersection.get_intersection(mouse.new, this.camera);
        const delta = current.clone().sub(this.translate_center);
        this.translate_center.copy(current);
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
        this.look.sub(v);
        this.strobe.position.copy(this.camera.position);
        this.strobe.quaternion.copy(this.camera.quaternion);
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
            if (this.selected_atoms.indexOf(i) == -1) {
                this.selected_atoms.push(i);
            }
        }
        this.objects.center(this.selected_atoms, this.center);
        this.look.copy(this.center).sub(this.camera.position);
        this.selection_box.collection = [];
        this.objects.set_emissive(this.selected_atoms, 0x0000ff);
        console.log(this.selected_atoms);
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
        this.look.copy(this.center).sub(this.camera.position);
        console.log(this.selected_atoms);
    }
    sync_input_to_objects() {
        for (let i = 0; i < this.input_manager.atoms.length; i += 1) {
            this.objects.atoms[i].position.copy(array_to_vector(this.input_manager.atoms[i].r));
        }
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