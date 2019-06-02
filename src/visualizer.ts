/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />
/// <reference path="../node_modules/\@types/file-saver/index.d.ts" />
/// <reference path="./common.ts"/>
/// <reference path="./input.ts"/>
/// <reference path="./objects.ts"/>
/// <reference path="./mousetracker.ts"/>
/// <reference path="./selectionbox.ts"/>
/// <reference path="./intersection.ts"/>
/// <reference path="./rotation.ts"/>


class Visualizer{
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  objects: Objects;
  strobe: THREE.Light;
  look: THREE.Vector3;
  center: THREE.Vector3;
  input_manager: InputManager;
  selection_box: SelectionBox;
  selection_box_helper: SelectionHelper;
  selected_atoms: number[];
  intersection: Intersection;
  rotation: Rotation;

  constructor(canvas: HTMLCanvasElement, cssClassName: string, deep: number){
    this.input_manager = new InputManager();

    this.camera = new THREE.PerspectiveCamera(45, 1.0);
    this.strobe = new THREE.PointLight(0xffffff);
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, })
    this.scene = new THREE.Scene();
    this.objects = new Objects();

    this.look = new THREE.Vector3(0.0, 0.0, -1);
    this.center = new THREE.Vector3();

    this.selection_box = new SelectionBox(this.camera, this.scene, deep);
    this.selection_box_helper = new SelectionHelper(this.selection_box, this.renderer, cssClassName);

    this.selected_atoms = [];
    this.intersection = new Intersection();

    this.rotation = new Rotation();
    this.onresize();
  }

  set_input(input: Input){
    this.input_manager.frame = 0;
    this.input_manager.input = input;
    this.prepare_objects();
    this.prepare_scene();
    this.objects.center(this.selected_atoms, this.center);
    this.look.copy(this.center).sub(this.camera.position);
  }

  sync_input_to_objects(){
    for(let i=0; i < this.input_manager.atoms.length; i+=1){
      this.objects.atoms[i].position.copy(array_to_vector(this.input_manager.atoms[i].r));
    }
    // TODO: Cell が関数で定義されていて更新に対応していないので直す。
    //       もしかしたら、Cell関係の処理をobjectsに引っ越した方がいいかも。
    if(this.input_manager.cell){
      for(const arrow of build_cell(this.input_manager.cell, [0x0000ff, 0x00ff00, 0xff0000], 0.05, 0.05)){
        this.objects.cells.push(arrow);
      }
    }
  }

  sync_objects_to_input(selected: number[]){
    for(const i of selected){
      this.input_manager.atoms[i].r = vector_to_array(this.objects.atoms[i].position)
    }
  }

  prepare_objects(){
    for(const atom of this.input_manager.atoms){
      const color = this.input_manager.input.element[atom.n].color;
      const radius = this.input_manager.input.element[atom.n].radius;
      const r = atom.r;
      this.objects.add_atom(radius, color, r[0], r[1], r[2]);
    }
    if(this.input_manager.cell){
      for(const arrow of build_cell(this.input_manager.cell, [0x0000ff, 0x00ff00, 0xff0000], 0.05, 0.05)){
        this.objects.cells.push(arrow);
      }
    }
  }

  prepare_scene(){
    while (this.scene.children.length > 0){
      this.scene.remove(this.scene.children[0]);
    }
    for(const mesh of this.objects.objects){
      this.scene.add(mesh);
    }
    if(this.objects.cells){
      for(const c of this.objects.cells){
        this.scene.add(c);
      }
    }
    this.scene.add(this.strobe);
  }

  render(){
    this.strobe.position.copy(this.camera.position);
    this.strobe.quaternion.copy(this.camera.quaternion);
    this.intersection.set_plane(this.camera, this.center);
    this.renderer.render(this.scene, this.camera);
  }

  onresize(){
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if(this.camera instanceof THREE.PerspectiveCamera){
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  rotate_camera(mouse: MouseTracker){
    this.rotation.set_from_delta_camera(mouse.delta, this.camera.quaternion);
    this.rotation.apply_rotation(this.center, [this.camera], [0]);
  }

  rotate_atoms(mouse: MouseTracker){
    this.rotation.set_from_delta_camera(mouse.delta, this.camera.quaternion);
    this.rotation.inverse();
    for(const i of this.selected_atoms){
      this.rotation.apply_rotation(this.center, this.objects.atoms, this.selected_atoms);
      this.input_manager.atoms[i].r = vector_to_array(this.objects.atoms[i].position)
    }
  }

  grabable(mouse: THREE.Vector2){
    if(this.intersection.intersect_objects(mouse, this.camera, this.objects.atoms).length > 0){
      return true;
    }else{
      return false;
    }
  }

  translate_atoms(mouse: MouseTracker){
    const now = this.intersection.get_intersection(mouse.new, this.camera).clone();
    const old = this.intersection.get_intersection(mouse.old, this.camera).clone();
    const delta = now.clone().sub(old);
    for(const i of this.selected_atoms){
      this.objects.atoms[i].position.add(delta);
      this.input_manager.atoms[i].r = vector_to_array(this.objects.atoms[i].position)
    }
  }

  translate_camera(mouse: MouseTracker){
    this.intersection.set_plane(this.camera, this.center);
    const now = this.intersection.get_intersection(mouse.new, this.camera).clone();
    const old = this.intersection.get_intersection(mouse.old, this.camera).clone();
    const delta = old.clone().sub(now);
    this.camera.position.add(delta);
  }

  zoom(delta: number){
    let alpha = 1.0;
    let v = new THREE.Vector3(0.0, 0.0, delta * alpha);
    v.applyQuaternion(this.camera.quaternion);
    this.camera.position.add(v);
    this.look.sub(v);
  }

  open_selection(event: MouseEvent, mouse: THREE.Vector2){
    this.selection_box_helper.selectStart(event);
    this.selection_box.startPoint.set(mouse.x, mouse.y, 0.5);
  }

  move_selection(event: MouseEvent, mouse: THREE.Vector2){
    for(const item of this.selection_box.collection){
      set_emissive(item.material, 0x000000);
    }
    this.selection_box_helper.selectMove(event);
    this.selection_box.endPoint.set(mouse.x, mouse.y, 0.5);
    this.objects.set_emissive(this.selected_atoms, 0x0000ff);
    for(const selected of this.selection_box.select()){
      set_emissive(selected.material, 0x0000ff);
    }
  }

  over_selection(event: MouseEvent, mouse: THREE.Vector2){
    this.selection_box_helper.selectOver(event);
    this.selection_box.endPoint.set(mouse.x, mouse.y, 0.5)
    for(const selected of this.selection_box.select()){
      const i = this.objects.atom_number(selected);
      if(i >= 0 && this.selected_atoms.indexOf(i) == -1){
        this.selected_atoms.push(i);
      }
    }
    this.objects.center(this.selected_atoms, this.center);
    this.look.copy(this.center).sub(this.camera.position);
    this.selection_box.collection = [];
    this.objects.set_emissive(this.selected_atoms, 0x0000ff);
  }

  single_selection(_: MouseEvent, mouse: THREE.Vector2){
    const intersects = this.intersection.intersect_objects(mouse, this.camera, this.objects.atoms)
    if(intersects.length == 0){
      clear(this.selected_atoms);
    }else{
      const i = this.objects.atom_number(intersects[0].object)
      const idx = this.selected_atoms.indexOf(i);
      if(idx == -1){
        this.selected_atoms.push(i);
      }else{
        this.selected_atoms.splice(idx);
      }
    }
    this.objects.set_emissive(this.selected_atoms, 0x0000ff);
    this.objects.center(this.selected_atoms, this.center);
    this.look.copy(this.center).sub(this.camera.position);
  }

  next(){
    this.input_manager.next();
    this.sync_input_to_objects();
  }
  prev(){
    this.input_manager.prev();
    this.sync_input_to_objects();
  }
}






// class Visualizer {
//   canvas: HTMLCanvasElement;
//   input?: Input;
//   renderer: THREE.WebGLRenderer;
//   scene: THREE.Scene;
//   camera: THREE.PerspectiveCamera;
//   camera_light: THREE.Light;
//   meshes: Array<THREE.Mesh>;
//   index: number; // The frame
//   look: THREE.Vector3;
//   mouse_is_down: boolean;
//   draged_atom?: THREE.Object3D;
//   draged_index: number;
//   intersection: THREE.Vector3;
//   offset: THREE.Vector3;
//   mouse: THREE.Vector2; // The position of mouse.
//   mode: number;
//   selected_atoms: Array<number>;
// 
//   constructor(canvas: HTMLCanvasElement) {
//     this.canvas = canvas;
//     this.input = undefined;
//     this.renderer = new THREE.WebGLRenderer({
//         canvas: canvas,
//         antialias: true,
//     })
//     this.scene = new THREE.Scene();
//     this.camera = new THREE.PerspectiveCamera(45, 1.0);
//     this.camera_light = new THREE.PointLight(0xffffff);
//     this.raycaster = new THREE.Raycaster();
//     this.meshes = [];
//     this.index = 0;
//     this.look = new THREE.Vector3();
//     this.mouse_is_down = false;
//     this.draged_atom = undefined;
//     this.draged_index = -1;
//     this.plane = new THREE.Plane();
//     this.intersection = new THREE.Vector3();
//     this.offset = new THREE.Vector3();
//     this.mouse = new THREE.Vector2();
//     this.mode = 0;
//     this.selected_atoms = [];
// 
//     this.camera.position.set(0.0, 0.0, 10.0);
//     this.look.sub(this.camera.position);
//   }
// 
//   /**
//    * There is a light at camera position.
//    * This function syncronize the light with camera position.
//    */
//   sync_camera_light(){
//     this.camera_light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
//   }
// 
//   onmousedown(event: MouseEvent){
//     event.preventDefault();
//     event.stopPropagation();
//     this.mouse_is_down = true;
//     this.set_mouse_position(event);
//     this.raycaster.setFromCamera(this.mouse, this.camera);
//     const intersects = this.raycaster.intersectObjects(this.meshes);
//     if (intersects.length > 0){
//       this.grab(intersects);
//     }
//   }
// 
//   grab(intersects: THREE.Intersection[]){
//     this.draged_atom = intersects[0].object;
//     let i = 0;
//     for (let mesh of this.meshes){
//       if (mesh.position == this.draged_atom.position){
//         this.draged_index = i;
//       }
//       i += 1;
//     }
//     const normal = new THREE.Vector3(0.0, 0.0, -1.0);
//     normal.applyQuaternion(this.camera.quaternion);
//     this.plane.setFromNormalAndCoplanarPoint(normal, this.draged_atom.position);
//     if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)){
//       this.offset.copy(this.intersection).sub(this.draged_atom.position);
//     }
//     this.look.copy(this.draged_atom.position).sub(this.camera.position);
//   }
// 
//   tick(){
//     this.renderer.render(this.scene, this.camera);
//     requestAnimationFrame(this.tick.bind(this));
//   }
// 
//   onresize(_: any){
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     this.renderer.setPixelRatio(window.devicePixelRatio);
//     this.renderer.setSize(width, height);
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//   }
// 
//   ondrop(event: any){
//     event.preventDefault();
//     const reader = new FileReader();
//     reader.readAsText(event.dataTransfer.files[0]);
//     reader.onload = (_:any)=>{
//       if (typeof reader.result == "string"){
//         this.input = JSON.parse(reader.result);
//         this.index = 0;
//         this.draw_atoms();
//         this.draw_cell();
//       }
//     };
//   }
// 
//   onwheel(event: WheelEvent){
//     event.preventDefault();
//     event.stopPropagation();
//     if (event.ctrlKey){
//       let alpha = 1.0;
//       let v = new THREE.Vector3(0.0, 0.0, event.deltaY * alpha);
//       v.applyQuaternion(this.camera.quaternion);
//       this.camera.position.add(v);
//       this.look.sub(v);
//     }else{
//       let alpha = 0.1;
//       let v = new THREE.Vector3(event.deltaX * alpha, -event.deltaY * alpha, 0.0);
//       v.applyQuaternion(this.camera.quaternion);
//       this.camera.position.add(v);
//     }
//     this.sync_camera_light();
//   }
// 
//   onmousemove(event: MouseEvent){
//     event.preventDefault();
//     event.stopPropagation();
//     if(this.mouse_is_down){
//       if(this.draged_atom){
//         this.drag(event);
//       }else{
//         this.rotate(event);
//       }
//     }
//     this.sync_camera_light();
//   }
// 
//   onmouseup(event: MouseEvent){
//     event.preventDefault();
//     event.stopPropagation();
//     this.mouse_is_down = false;
//     this.draged_atom = undefined;
//     this.set_mouse_position(event);
//   }
// 
//   download(){
//     const blob = new Blob([JSON.stringify(this.input)], {"type": "text/plain"});
//     saveAs(blob, "download.json")
//   }
// 
//   set_mouse_position(event: MouseEvent){
//     const element = this.canvas;
//     const x = event.clientX - element.offsetLeft;
//     const y = event.clientY - element.offsetTop;
//     const w = element.offsetWidth;
//     const h = element.offsetHeight;
//     this.mouse.set((x / w) * 2 - 1, -(y / h) * 2 + 1);
//   }
// 
//   rotate(event: MouseEvent){
//     let old_mouse = this.mouse.clone();
//     this.set_mouse_position(event);
//     let delta = this.mouse.clone().sub(old_mouse);
//     let length = delta.length();
//     delta.normalize();
//     let angle = 2 * Math.PI * length;
//     let quaternion = new THREE.Quaternion(delta.y * Math.sin(angle/2), -delta.x * Math.sin(angle/2), 0.0, Math.cos(angle/2));
//     let quaternion_camera = this.camera.quaternion.clone();
//     quaternion.normalize();
//     quaternion_camera.normalize();
//     let quaternion_camera_inverse = quaternion_camera.clone().inverse();
//     let rot = quaternion_camera.multiply(quaternion).multiply(quaternion_camera_inverse);
//     this.camera.applyQuaternion(rot);
//     this.camera.position.add(this.look);
//     this.look.applyQuaternion(rot);
//     this.camera.position.sub(this.look);
//   }
// 
//   drag(event: MouseEvent){
//     if(this.draged_atom){
//       this.set_mouse_position(event);
//       this.raycaster.setFromCamera(this.mouse, this.camera);
//       if(this.raycaster.ray.intersectPlane(this.plane, this.intersection)){
//         this.draged_atom.position.copy(this.intersection.sub(this.offset));
//         if(!this.input){
//           return;
//         }
//         let atom = this.input.atoms[this.index].atoms[this.draged_index];
//         atom.r[0] = this.draged_atom.position.x;
//         atom.r[1] = this.draged_atom.position.y;
//         atom.r[2] = this.draged_atom.position.z;
//       }
//     }
//   }
// 
//   clear(){
//     const {scene, meshes} = this;
//     while (scene.children.length > 0){
//       scene.remove(scene.children[0]);
//     }
//     while (meshes.length > 0){
//       meshes.pop();
//     }
//   }
// 
//   draw_atoms(){
//     this.clear();
//     if(!this.input){
//       return;
//     }
//     let atoms = this.input.atoms[this.index];
//     for (const atom of atoms.atoms){
//       let mesh = new THREE.Mesh(
//         new THREE.SphereGeometry(this.input.element[atom.n].radius, 32, 32),
//         new THREE.MeshLambertMaterial({color: this.input.element[atom.n].color})
//       )
//       mesh.position.set(atom.r[0], atom.r[1], atom.r[2]);
//       this.meshes.push(mesh);
//       this.scene.add(mesh);
//     }
//     this.scene.add(this.camera_light);
//   }
// 
//   draw_cell(){
//     if(!this.input){
//       return;
//     }
//     const cell = this.input.atoms[this.index].cell
//     if (cell){
//       const lattice = cell.map(array_to_vector);
//       const z = new THREE.Vector3();
//       const p0 = lattice[0];
//       const p1 = lattice[1];
//       const p2 = lattice[2];
//       const p01 = p0.clone().add(p1);
//       const p12 = p1.clone().add(p2);
//       const p20 = p2.clone().add(p0);
//       const p012 = p01.clone().add(p2);
//       this.scene.add(arrow_helper(z, p0, 0xff0000, 1.0, 1.0));
//       this.scene.add(arrow_helper(z, p1, 0x00ff00, 1.0, 1.0));
//       this.scene.add(arrow_helper(z, p2, 0x0000ff, 1.0, 1.0));
//       this.scene.add(arrow_helper(p0, p01, 0xffffff, 0.01, 0.01));
//       this.scene.add(arrow_helper(p0, p20, 0xffffff, 0.01, 0.01));
//       this.scene.add(arrow_helper(p1, p01, 0xffffff, 0.01, 0.01));
//       this.scene.add(arrow_helper(p1, p12, 0xffffff, 0.01, 0.01));
//       this.scene.add(arrow_helper(p2, p12, 0xffffff, 0.01, 0.01));
//       this.scene.add(arrow_helper(p2, p20, 0xffffff, 0.01, 0.01));
//       this.scene.add(arrow_helper(p12, p012, 0xffffff, 0.01, 0.01));
//       this.scene.add(arrow_helper(p20, p012, 0xffffff, 0.01, 0.01));
//       this.scene.add(arrow_helper(p01, p012, 0xffffff, 0.01, 0.01));
//     }
//   }
// }
// 
// 
// function arrow_helper(s: THREE.Vector3, e:THREE.Vector3, hex:number, headLength: number, headWidth: number){
//   const es = e.clone().sub(s);
//   const length = es.length();
//   const origin = s;
//   const dir = es.normalize();
//   return new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
// }
// 
//   // oncontextmenu(event: MouseEvent){
//   //   this.download();
//   //   event.preventDefault();
//   //   event.stopPropagation();
//   // }
// 