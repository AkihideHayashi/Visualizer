
/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />

function* chain_mesh(mesheses: THREE.Mesh[][]){
  for(const meshes of mesheses){
    for(const mesh of meshes){
      yield mesh;
    }
  }
}

class Objects{
  atoms: THREE.Mesh[];
  bonds: THREE.Mesh[];

  constructor(){
    this.atoms = [];
    this.bonds = [];
  }

  get objects(){
    return chain_mesh([this.atoms, this.bonds])
  }

  add_atom(radius: number, color: number, x: number, y: number, z: number){
    const new_atom = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshLambertMaterial({color: color})
    )
    new_atom.position.set(x, y, z);
    this.atoms.push(new_atom);
  }

  clear(){
    while (this.atoms.length > 0){
      this.atoms.pop();
    }
    while (this.bonds.length > 0){
      this.bonds.pop();
    }
  }

  atom_number(mesh: THREE.Object3D){
    let i = 0;
    for(const atom of this.atoms){
      if(atom == mesh){
        return i;
      }
      i += 1;
    }
    return -1;
  }

  // r is overwritten by center
  center(selection: number[], r: THREE.Vector3){
    let n = 0;
    r.set(0.0, 0.0, 0.0)
    if(selection.length > 0){
      for(const i of selection){
        n += 1;
        r.add(this.atoms[i].position);
      }
    }else{
      for(let i = 0; i < this.atoms.length; i++){
        n += 1;
        r.add(this.atoms[i].position);
      }
    }
    r.divideScalar(n);
    return r;
  }

  set_emissive(selected: number[], color: number){
    for(const atom of this.atoms){
      set_emissive(atom.material, 0x000000);
    }
    for(const i of selected){
      set_emissive(this.atoms[i].material, color);
    }
  }
}

function set_emissive(material: THREE.Material | THREE.Material[], color: number){
  if(material instanceof THREE.MeshLambertMaterial || 
     material instanceof THREE.MeshPhysicalMaterial || 
     material instanceof THREE.MeshPhongMaterial ||
     material instanceof THREE.MeshStandardMaterial ||
     material instanceof THREE.MeshToonMaterial){
    material.emissive.set(color);
  }
}