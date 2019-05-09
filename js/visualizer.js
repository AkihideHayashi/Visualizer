// import { log } from "winjs";

const color = {
    H: 0xffffff,
    Pt: 0xa0a0a0,
}

const radius = {
    H: 0.31,
    Pt: 1.39,
}

function init_visualizer(canvas) {
    let objects = new Visualizer(canvas);
    canvas.addEventListener('drop', objects.read_file());
    window.addEventListener('resize', ()=>onResize(objects));
    onResize(objects);
    tick(objects);
}

class Visualizer {
    constructor(canvas, input) {
        this.canvas = canvas;
        this.input = input;
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        })
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1.0);
        this.camera_light = new THREE.PointLight(0xffffff);
        this.raycaster = new THREE.Raycaster();
        this.meshes = [];
        this.input = [];
        this.index = 0;
        this.controls = new OrbitControls(this);
        console.log(this);
    }

    read_file(){
        let self = this;
        function inner(event){
            event.preventDefault();
            const reader = new FileReader();
            reader.readAsText(event.dataTransfer.files[0]);
            reader.addEventListener('load', function(e){
                self.input = JSON.parse(reader.result);
                self.index = 0;
                self.draw_atoms();
            })
        }
        return inner;
    }

    draw_atoms(){
        const {scene, meshes, index} = this;
        let env = this.input[index];
        while(meshes.length > 0){
            meshes.pop(0);
        }
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
        scene.add(this.camera_light);
        for (const atom of env.atoms){
            let mesh = new THREE.Mesh(
                new THREE.SphereGeometry( radius[atom.n], 32, 32 ),
                new THREE.MeshLambertMaterial({ color: color[atom.n] })
            );
            mesh.position.set(atom.x, atom.y, atom.z);
            scene.add(mesh);
            meshes.push(mesh);
        }
        if (env.cell){
            const lattice = [
                new THREE.Vector3(env.cell[0][0], env.cell[0][1], env.cell[0][2]),
                new THREE.Vector3(env.cell[1][0], env.cell[1][1], env.cell[1][2]),
                new THREE.Vector3(env.cell[2][0], env.cell[2][1], env.cell[2][2])
            ];
            draw_lattice(scene, lattice);
        }
    }
    
}

// function read_file(objects){
//     return function(e){
//         const reader = new FileReader();
//         reader.readAsText(e.dataTransfer.files[0]);
//         reader.addEventListener('load', function(){
//             objects.input = JSON.parse(reader.result);
//             objects.n = 0;
//             draw_atoms(objects);
//         })
//         e.preventDefault();
//     }
// }

function tick(objects){
    objects.renderer.render(objects.scene, objects.camera);
    requestAnimationFrame(()=>tick(objects));
}

function onResize(objects){
    const width = window.innerWidth;
    const height = window.innerHeight;
    objects.renderer.setPixelRatio(window.devicePixelRatio);
    objects.renderer.setSize(width, height);
    objects.camera.aspect = width / height;
    objects.camera.updateProjectionMatrix();
}


// function draw_atoms(objects){
//     const {scene, meshes, index} = objects;
//     env = objects.input[index];
//     while(meshes.length > 0){
//         meshes.pop(0);
//     }
//     while(scene.children.length > 0){ 
//         scene.remove(scene.children[0]); 
//     }
//     scene.add(objects.camera_light);
//     for (const atom of env.atoms){
//         mesh = new THREE.Mesh(
//             new THREE.SphereGeometry( radius[atom.n], 32, 32 ),
//             new THREE.MeshLambertMaterial({ color: color[atom.n] })
//         );
//         mesh.position.set(atom.x, atom.y, atom.z);
//         scene.add(mesh);
//         meshes.push(mesh);
//     }
//     if (env.cell){
//         const lattice = [
//             new THREE.Vector3(env.cell[0][0], env.cell[0][1], env.cell[0][2]),
//             new THREE.Vector3(env.cell[1][0], env.cell[1][1], env.cell[1][2]),
//             new THREE.Vector3(env.cell[2][0], env.cell[2][1], env.cell[2][2])
//         ];
//         draw_lattice(scene, lattice);
//     }
// }

function draw_lattice(scene, lattice){
    z = new THREE.Vector3(0.0, 0.0, 0.0);
    l0 = lattice[0];
    l1 = lattice[1];
    l2 = lattice[2];
    l01 = l0.clone().add(l1);
    l02 = l0.clone().add(l2);
    l12 = l1.clone().add(l2);
    l012 = l01.clone().add(l2);
    scene.add(arrow(  z,   l0, 0xffffff, 0.01, 0.01));
    scene.add(arrow(  z,   l1, 0xffffff, 0.01, 0.01));
    scene.add(arrow(  z,   l2, 0xffffff, 0.01, 0.01));
    scene.add(arrow( l0,  l01, 0xffffff, 0.01, 0.01));
    scene.add(arrow( l0,  l02, 0xffffff, 0.01, 0.01));
    scene.add(arrow( l1,  l12, 0xffffff, 0.01, 0.01));
    scene.add(arrow( l1,  l01, 0xffffff, 0.01, 0.01));
    scene.add(arrow( l2,  l12, 0xffffff, 0.01, 0.01));
    scene.add(arrow( l2,  l02, 0xffffff, 0.01, 0.01));
    scene.add(arrow(l01, l012, 0xffffff, 0.01, 0.01));
    scene.add(arrow(l12, l012, 0xffffff, 0.01, 0.01));
    scene.add(arrow(l02, l012, 0xffffff, 0.01, 0.01));
    function arrow(start, end, color, headlength, headwidth){
        let v = end.clone().sub(start);
        let l = v.length();
        let n = v.clone().normalize();
        return new THREE.ArrowHelper(n, start, l, color, headlength, headwidth);
    }
}




OrbitControls = function ( objects ) {
    const {light, camera, raycaster, meshes} = objects;
    camera.position.set(0, 0, +100);
    objects.camera_light.position.copy(camera.position);
    objects.scene.add(objects.camera_light);
    let look = new THREE.Vector3(0.0, 0.0, 0.0).sub(camera.position);
    let mouse = new THREE.Vector2(0.0, 0.0);
    let mouse_is_down = false;
    let draged_atom = null;


    function update_light(){
        objects.camera_light.position.copy(camera.position);
    }

    function onwheel(event){
        event.preventDefault();
        event.stopPropagation();
        if (event.ctrlKey){
            let alpha = 1.0;
            let v = new THREE.Vector3(0.0, 0.0, event.deltaY * alpha);
            v.applyQuaternion(camera.quaternion);
            camera.position.add(v);
            look.sub(v);
        }else{
            let alpha = 0.1;
            let v = new THREE.Vector3(event.deltaX * alpha, -event.deltaY * alpha, 0.0);
            v.applyQuaternion(camera.quaternion);
            camera.position.add(v);
        }
        update_light();
    }


    function set_mouse_position(event){
        const element = event.currentTarget;
        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;
        const w = element.offsetWidth;
        const h = element.offsetHeight;
        mouse.set((x / w) * 2 - 1, -(y / h) * 2 + 1);
    }

    function onmousedown(event){
        event.preventDefault();
        event.stopPropagation();
        mouse_is_down = true;

        // mouse_position.set(event.x, event.y);
        set_mouse_position(event);

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0){
            draged_atom = intersects[0].object;
        }
    }

    function onmousemove(event){
        event.preventDefault();
        event.stopPropagation();
        old_mouse = mouse.clone();
        set_mouse_position(event);
        if(mouse_is_down){
            let d2 = mouse.clone().sub(old_mouse);
            if(draged_atom){
                alpha = 10.0
                d3 = new THREE.Vector3(d2.x * alpha, d2.y * alpha, 0.0);
                let qc = camera.quaternion.clone();
                qc.normalize();
                trans = d3.applyQuaternion(qc)
                draged_atom.position.add(trans);
            }else{
                let d = d2.length();
                d2.normalize();
                let angle = 2 * Math.PI * d;
                let q3 = new THREE.Quaternion(d2.y * Math.sin(angle/2), -d2.x * Math.sin(angle/2), 0.0, Math.cos(angle/2));
                let qc = camera.quaternion.clone();
                q3.normalize();
                qc.normalize();
                let qci = qc.clone().inverse();
                let rot = qc.multiply(q3).multiply(qci);
                camera.applyQuaternion(rot);
                camera.position.add(look);
                look.applyQuaternion(rot);
                camera.position.sub(look);
            }
        }
        update_light();
    }

    function onmouseup(event){
        event.preventDefault();
        event.stopPropagation();
        mouse_is_down = false;
        draged_atom = null;
        set_mouse_position(event);
    }

    // function oncontextmenu(event){
    //     let input = objects.input;
    //     for(i in input){
    //         v = meshes[i].position;
    //         atoms[i].x = v.x;
    //         atoms[i].y = v.y;
    //         atoms[i].z = v.z;
    //     }
    //     console.log(atoms);
    //     let blob = new Blob([JSON.stringify([{atoms: atoms}])], {"type": "text/plain"});
    //     // document.getElementById("download").href = window.URL.createObjectURL(blob);
    //     saveAs(blob, "ouput.json")
    //     event.preventDefault();
    //     event.stopPropagation();
    // }

    objects.canvas.addEventListener('wheel', onwheel, false);
    objects.canvas.addEventListener('mousedown', onmousedown, false);
    objects.canvas.addEventListener('mouseup', onmouseup, false);
    objects.canvas.addEventListener('mousemove', onmousemove, false);
    objects.canvas.addEventListener('contextmenu', oncontextmenu, false);
    // function onKeyDown(event){
    //     objects.camera.rotation.z += 0.1;
    // }
    // document.addEventListener('keydown', onKeyDown, false);
}