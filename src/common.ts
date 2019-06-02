/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />

function array_to_vector(array: Array<number>){
  return new THREE.Vector3(array[0], array[1], array[2]);
}

function vector_to_array(vector: THREE.Vector3){
  return [vector.x, vector.y, vector.z];
}

function clear(array: Array<any>){
  while(array.length > 0){
    array.pop();
  }
}