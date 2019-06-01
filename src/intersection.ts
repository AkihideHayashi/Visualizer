/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />
/// <reference path="./mousetracker.ts"/>

class Intersection {
  raycaster: THREE.Raycaster;
  plane: THREE.Plane;
  normal: THREE.Vector3;
  intersection: THREE.Vector3;
  offset: THREE.Vector3;
  constructor(){
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane();
    this.normal = new THREE.Vector3();
    this.intersection = new THREE.Vector3();
    this.offset = new THREE.Vector3();
  }

  intersect_objects(mouse: THREE.Vector2, camera: THREE.Camera, meshes: THREE.Mesh[]){
    this.raycaster.setFromCamera(mouse, camera);
    const intersects = this.raycaster.intersectObjects(meshes);
    return intersects;
  }

  set_plane(camera: THREE.Camera, position: THREE.Vector3){
    this.normal.set(0.0, 0.0, -1.0);
    this.normal.applyQuaternion(camera.quaternion);
    this.plane.setFromNormalAndCoplanarPoint(this.normal, position);
  }

  get_intersection(mouse: THREE.Vector2, camera: THREE.Camera){
    this.raycaster.setFromCamera(mouse, camera);
    this.raycaster.ray.intersectPlane(this.plane, this.intersection);
    return this.intersection;
  }
}