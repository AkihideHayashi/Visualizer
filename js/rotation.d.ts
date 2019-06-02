declare class Rotation {
    quaternion: THREE.Quaternion;
    camera: THREE.Quaternion;
    camera_inv: THREE.Quaternion;
    delta2: THREE.Vector2;
    delta3: THREE.Vector3;
    constructor();
    set_from_delta_camera(delta: THREE.Vector2, camera: THREE.Quaternion): THREE.Quaternion;
    apply_rotation(center: THREE.Vector3, objects: THREE.Object3D[], selected: number[]): void;
}
