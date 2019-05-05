// import { log } from "winjs";

function init_visualizer(canvas) {
    objects = init_objects(canvas);
    canvas.addEventListener('drop', read_file(objects));
    window.addEventListener('resize', ()=>onResize(objects));
    onResize(objects);
    tick(objects);
}

const colors = {
    H: 0xffffff,
    Pt: 0xa0a0a0,
}

function draw_atoms(objects){
    const {scene, atoms, meshes} = objects;
    while(meshes.length > 0){
        meshes.pop(0);
    }
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    scene.add(objects.light);
    for (const atom of atoms){
        mesh = new THREE.Mesh(
            new THREE.SphereGeometry( 1, 32, 32 ),
            new THREE.MeshLambertMaterial({ color: colors[atom.n] })
        );
        // new THREE.DragControls([mesh], objects.camera, objects.renderer.domElement);
        mesh.position.set(atom.x, atom.y, atom.z);
        scene.add(mesh);
        meshes.push(mesh);
    }
}

function init_objects(canvas){
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(45, 1.0);
    camera.position.set(0, 0, +100);

    let light = new THREE.PointLight(0xffffff);
    light.position.set(1, 1, 1);

    let raycaster = new THREE.Raycaster();

    let atoms = [];

    // const controls = new THREE.OrbitControls(camera, pointLight, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.2;

    scene.add(light);
    let objects = {canvas: canvas, renderer: renderer, scene: scene, camera: camera, light: light, raycaster: raycaster, atoms: atoms, meshes: []};
    const controls = new OrbitControls(objects);
    return objects;
}

function read_file(objects){
    return function(e){
        const reader = new FileReader();
        reader.readAsText(e.dataTransfer.files[0]);
        reader.addEventListener('load', function(){
            objects.atoms = JSON.parse(reader.result)[0].atoms;
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