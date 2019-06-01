/// <reference path="mousetracker.d.ts" />
declare class Intersection {
    raycaster: THREE.Raycaster;
    plane: THREE.Plane;
    normal: THREE.Vector3;
    intersection: THREE.Vector3;
    offset: THREE.Vector3;
    constructor();
    intersect_objects(mouse: THREE.Vector2, camera: THREE.Camera, meshes: THREE.Mesh[]): THREE.Intersection[];
    set_plane(camera: THREE.Camera, position: THREE.Vector3): void;
    get_intersection(mouse: THREE.Vector2, camera: THREE.Camera): THREE.Vector3;
}
