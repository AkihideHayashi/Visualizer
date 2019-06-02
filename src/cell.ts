/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />
/// <reference path="./common.ts" />

function build_cell(cell: number[][], hexes: number[], headLengthRatio: number, headWidthRatio: number){
    const abc0 = new THREE.Vector3();
    const abc1 = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const abc2 = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const abc3 = new THREE.Vector3();
    for(let i=0; i<3; i++){
        abc1[i].set(cell[i][0], cell[i][1], cell[i][2]);
    }
    for(let i=0; i<3; i++){
        for(let j=0; j<3; j++){
            if(i != j){
                abc2[i].add(abc1[j]);
            }
        }
    }
    for(let i=0; i<3; i++){
        abc3.add(abc1[i])
    }
    const cell_objects: THREE.ArrowHelper[] = [];
    for(let i=0; i<3; i++){
        cell_objects.push(new_arrow_helper(abc0, abc1[i], hexes[i], headLengthRatio, headWidthRatio));
    }
    for(let i=0; i<3; i++){
        for(let j=0; j<3; j++){
            if(i!=j){
                cell_objects.push(new_arrow_helper(abc1[i], abc2[j], 0xffffff, 1E-10, 1E-10));
            }
        }
    }
    for(let i=0; i<3; i++){
        cell_objects.push(new_arrow_helper(abc2[i], abc3, 0xffffff, 1E-10, 1E-10));
    }
    return cell_objects;
}

function new_arrow_helper(start: THREE.Vector3, end: THREE.Vector3, hex: number, headLengthRation: number, headWidthRatio: number){
    const tmp = new THREE.Vector3();
    tmp.copy(end).sub(start);
    const length = tmp.length();
    tmp.normalize();
    return new THREE.ArrowHelper(tmp, start, length, hex, length * headLengthRation, length * headWidthRatio);
}
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

