"use strict";
function build_cell(cell, hexes, headLengthRatio, headWidthRatio) {
    const abc0 = new THREE.Vector3();
    const abc1 = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const abc2 = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const abc3 = new THREE.Vector3();
    for (let i = 0; i < 3; i++) {
        abc1[i].set(cell[i][0], cell[i][1], cell[i][2]);
    }
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i != j) {
                abc2[i].add(abc1[j]);
            }
        }
    }
    for (let i = 0; i < 3; i++) {
        abc3.add(abc1[i]);
    }
    const cell_objects = [];
    for (let i = 0; i < 3; i++) {
        cell_objects.push(new_arrow_helper(abc0, abc1[i], hexes[i], headLengthRatio, headWidthRatio));
    }
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i != j) {
                cell_objects.push(new_arrow_helper(abc1[i], abc2[j], 0xffffff, 1E-10, 1E-10));
            }
        }
    }
    for (let i = 0; i < 3; i++) {
        cell_objects.push(new_arrow_helper(abc2[i], abc3, 0xffffff, 1E-10, 1E-10));
    }
    return cell_objects;
}
function new_arrow_helper(start, end, hex, headLengthRation, headWidthRatio) {
    const tmp = new THREE.Vector3();
    tmp.copy(end).sub(start);
    const length = tmp.length();
    tmp.normalize();
    return new THREE.ArrowHelper(tmp, start, length, hex, length * headLengthRation, length * headWidthRatio);
}
//# sourceMappingURL=cell.js.map