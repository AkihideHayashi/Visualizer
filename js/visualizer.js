// import { log } from "winjs";

function init_visualizer(canvas) {
    objects = init_objects(canvas);
    canvas.addEventListener('drop', read_file(objects));
    window.addEventListener('resize', ()=>onResize(objects));
    onResize(objects);
    tick(objects);
}

function init_objects(canvas){
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(45, 1.0);
    let light = new THREE.PointLight(0xffffff);
    let raycaster = new THREE.Raycaster();
    let atoms = [];
    let n = 0;

    // scene.add(light);
    let objects = {canvas: canvas, renderer: renderer, scene: scene, camera: camera, light: light, raycaster: raycaster, atoms: atoms, meshes: [], n:n};
    const controls = new OrbitControls(objects);
    return objects;
}

const color = {
    H: 0xffffff,
    Pt: 0xa0a0a0,
}

const radius = {
    H: 0.31,
    Pt: 1.39,
}

function draw_atoms(objects){
    const {scene, meshes, n} = objects;
    env = objects.atoms[n];
    while(meshes.length > 0){
        meshes.pop(0);
    }
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    scene.add(objects.light);
    for (const atom of env.atoms){
        mesh = new THREE.Mesh(
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
}

function arrow(start, end, color, headlength, headwidth){
    let v = end.clone().sub(start);
    let l = v.length();
    let n = v.clone().normalize();
    return new THREE.ArrowHelper(n, start, l, color, headlength, headwidth);
}


function read_file(objects){
    return function(e){
        const reader = new FileReader();
        reader.readAsText(e.dataTransfer.files[0]);
        reader.addEventListener('load', function(){
            objects.atoms = JSON.parse(reader.result);
            objects.n = 0;
            draw_atoms(objects);
        })
        e.preventDefault();
    }
}

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

OrbitControls = function ( objects ) {
    const {light, camera, raycaster, meshes} = objects;
    camera.position.set(0, 0, +100);
    objects.light.position.copy(camera.position);
    objects.scene.add(objects.light);
    let look = new THREE.Vector3(0.0, 0.0, 0.0).sub(camera.position);
    let mouse = new THREE.Vector2(0.0, 0.0);
    let mouse_is_down = false;
    let draged_atom = null;


    function update_light(){
        objects.light.position.copy(camera.position);
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

    function oncontextmenu(event){
        let atoms = objects.atoms;
        for(i in atoms){
            v = meshes[i].position;
            atoms[i].x = v.x;
            atoms[i].y = v.y;
            atoms[i].z = v.z;
        }
        console.log(atoms);
        let blob = new Blob([JSON.stringify([{atoms: atoms}])], {"type": "text/plain"});
        // document.getElementById("download").href = window.URL.createObjectURL(blob);
        saveAs(blob, "ouput.json")
        event.preventDefault();
        event.stopPropagation();
    }

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