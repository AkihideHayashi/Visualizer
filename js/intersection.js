"use strict";
class Intersection {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane();
        this.normal = new THREE.Vector3();
        this.intersection = new THREE.Vector3();
        this.offset = new THREE.Vector3();
    }
    intersect_objects(mouse, camera, meshes) {
        this.raycaster.setFromCamera(mouse, camera);
        const intersects = this.raycaster.intersectObjects(meshes);
        return intersects;
    }
    set_plane(camera, position) {
        this.normal.set(0.0, 0.0, -1.0);
        this.normal.applyQuaternion(camera.quaternion);
        this.plane.setFromNormalAndCoplanarPoint(this.normal, position);
    }
    get_intersection(mouse, camera) {
        this.raycaster.setFromCamera(mouse, camera);
        this.raycaster.ray.intersectPlane(this.plane, this.intersection);
        return this.intersection;
    }
}
//# sourceMappingURL=intersection.js.map