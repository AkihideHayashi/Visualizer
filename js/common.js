"use strict";
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
//# sourceMappingURL=common.js.map