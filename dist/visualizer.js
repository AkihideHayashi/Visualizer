"use strict";
const color = {
    H: 0xffffff,
    Pt: 0xa0a0a0,
};
const radius = {
    H: 0.31,
    Pt: 1.39,
};
function init_visualizer(canvas) {
    let visualizer = new Visualizer(canvas);
    window.ondrop = visualizer.ondrop.bind(visualizer);
    window.onresize = visualizer.onresize.bind(visualizer);
    canvas.onwheel = visualizer.onwheel.bind(visualizer);
    canvas.onmouseup = visualizer.onmouseup.bind(visualizer);
    canvas.onmousemove = visualizer.onmousemove.bind(visualizer);
    canvas.onmousedown = visualizer.onmousedown.bind(visualizer);
    canvas.oncontextmenu = visualizer.oncontextmenu.bind(visualizer);
    visualizer.onresize(null);
    visualizer.sync_camera_light();
    visualizer.tick();
}
class Visualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.input = [];
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1.0);
        this.camera_light = new THREE.PointLight(0xffffff);
        this.raycaster = new THREE.Raycaster();
        this.meshes = [];
        this.input = [];
        this.index = 0;
        this.look = new THREE.Vector3();
        this.mouse_is_down = false;
        this.draged_atom = undefined;
        this.draged_index = -1;
        this.plane = new THREE.Plane();
        this.intersection = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.mouse = new THREE.Vector2();
        this.camera.position.set(0.0, 0.0, 10.0);
        this.look.sub(this.camera.position);
    }
    sync_camera_light() {
        this.camera_light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    }
    tick() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.tick.bind(this));
    }
    onresize(_) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    ondrop(event) {
        event.preventDefault();
        const reader = new FileReader();
        reader.readAsText(event.dataTransfer.files[0]);
        reader.onload = (_) => {
            if (typeof reader.result == "string") {
                this.input = JSON.parse(reader.result);
                this.index = 0;
                this.draw_atoms();
                this.draw_cell();
            }
        };
    }
    clear() {
        const { scene, meshes } = this;
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
        while (meshes.length > 0) {
            meshes.pop();
        }
    }
    onwheel(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.ctrlKey) {
            let alpha = 1.0;
            let v = new THREE.Vector3(0.0, 0.0, event.deltaY * alpha);
            v.applyQuaternion(this.camera.quaternion);
            this.camera.position.add(v);
            this.look.sub(v);
        }
        else {
            let alpha = 0.1;
            let v = new THREE.Vector3(event.deltaX * alpha, -event.deltaY * alpha, 0.0);
            v.applyQuaternion(this.camera.quaternion);
            this.camera.position.add(v);
        }
        this.sync_camera_light();
    }
    onmousedown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.mouse_is_down = true;
        this.set_mouse_position(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.meshes);
        if (intersects.length > 0) {
            this.draged_atom = intersects[0].object;
            let i = 0;
            for (let mesh of this.meshes) {
                if (mesh.position == this.draged_atom.position) {
                    this.draged_index = i;
                }
                i += 1;
            }
            const normal = new THREE.Vector3(0.0, 0.0, -1.0);
            normal.applyQuaternion(this.camera.quaternion);
            this.plane.setFromNormalAndCoplanarPoint(normal, this.draged_atom.position);
            if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
                this.offset.copy(this.intersection).sub(this.draged_atom.position);
            }
        }
    }
    rotate(event) {
        let old_mouse = this.mouse.clone();
        this.set_mouse_position(event);
        let delta = this.mouse.clone().sub(old_mouse);
        let length = delta.length();
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
    }
    drag(event) {
        if (this.draged_atom) {
            this.set_mouse_position(event);
            this.raycaster.setFromCamera(this.mouse, this.camera);
            if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
                this.draged_atom.position.copy(this.intersection.sub(this.offset));
                let atom = this.input[this.index].atoms[this.draged_index];
                atom.x = this.draged_atom.position.x;
                atom.y = this.draged_atom.position.y;
                atom.z = this.draged_atom.position.z;
            }
        }
    }
    onmousemove(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.mouse_is_down) {
            if (this.draged_atom) {
                this.drag(event);
            }
            else {
                this.rotate(event);
            }
        }
        this.sync_camera_light();
    }
    onmouseup(event) {
        event.preventDefault();
        event.stopPropagation();
        this.mouse_is_down = false;
        this.draged_atom = undefined;
        this.set_mouse_position(event);
    }
    oncontextmenu(event) {
        let blob = new Blob([JSON.stringify(this.input)], { "type": "text/plain" });
        saveAs(blob, "ouput.json");
        event.preventDefault();
        event.stopPropagation();
    }
    set_mouse_position(event) {
        const element = this.canvas;
        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;
        const w = element.offsetWidth;
        const h = element.offsetHeight;
        this.mouse.set((x / w) * 2 - 1, -(y / h) * 2 + 1);
    }
    draw_atoms() {
        this.clear();
        let atoms = this.input[this.index];
        for (const atom of atoms.atoms) {
            let mesh = new THREE.Mesh(new THREE.SphereGeometry(radius[atom.n], 32, 32), new THREE.MeshLambertMaterial({ color: color[atom.n] }));
            mesh.position.set(atom.x, atom.y, atom.z);
            this.meshes.push(mesh);
            this.scene.add(mesh);
        }
        this.scene.add(this.camera_light);
    }
    draw_cell() {
        const cell = this.input[this.index].cell;
        if (cell) {
            const lattice = cell.map(array_to_vector);
            const z = new THREE.Vector3();
            const p0 = lattice[0];
            const p1 = lattice[1];
            const p2 = lattice[2];
            const p01 = p0.clone().add(p1);
            const p12 = p1.clone().add(p2);
            const p20 = p2.clone().add(p0);
            const p012 = p01.clone().add(p2);
            this.scene.add(arrow_helper(z, p0, 0xff0000, 1.0, 1.0));
            this.scene.add(arrow_helper(z, p1, 0x00ff00, 1.0, 1.0));
            this.scene.add(arrow_helper(z, p2, 0x0000ff, 1.0, 1.0));
            this.scene.add(arrow_helper(p0, p01, 0xffffff, 0.01, 0.01));
            this.scene.add(arrow_helper(p0, p20, 0xffffff, 0.01, 0.01));
            this.scene.add(arrow_helper(p1, p01, 0xffffff, 0.01, 0.01));
            this.scene.add(arrow_helper(p1, p12, 0xffffff, 0.01, 0.01));
            this.scene.add(arrow_helper(p2, p12, 0xffffff, 0.01, 0.01));
            this.scene.add(arrow_helper(p2, p20, 0xffffff, 0.01, 0.01));
            this.scene.add(arrow_helper(p12, p012, 0xffffff, 0.01, 0.01));
            this.scene.add(arrow_helper(p20, p012, 0xffffff, 0.01, 0.01));
            this.scene.add(arrow_helper(p01, p012, 0xffffff, 0.01, 0.01));
        }
    }
}
function array_to_vector(array) {
    return new THREE.Vector3(array[0], array[1], array[2]);
}
function arrow_helper(s, e, hex, headLength, headWidth) {
    const es = e.clone().sub(s);
    const length = es.length();
    const origin = s;
    const dir = es.normalize();
    return new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
}
//# sourceMappingURL=visualizer.js.map