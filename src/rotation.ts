/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />
class Rotation{
    quaternion: THREE.Quaternion;
    camera: THREE.Quaternion;
    camera_inv: THREE.Quaternion;
    delta2: THREE.Vector2;
    delta3: THREE.Vector3;
    constructor(){
        this.quaternion = new THREE.Quaternion();
        this.camera = new THREE.Quaternion();
        this.camera_inv = new THREE.Quaternion();
        this.delta2 = new THREE.Vector2();
        this.delta3 = new THREE.Vector3();
    }

    inverse(){
        this.quaternion.inverse();
    }

    set_from_delta_camera(delta: THREE.Vector2, camera: THREE.Quaternion){
        this.delta2.copy(delta.clone());
        const length = this.delta2.length();
        this.delta2.normalize();
        this.camera.copy(camera.clone());
        this.camera.normalize();
        this.camera_inv.copy(camera.clone());
        this.camera_inv.normalize();
        this.camera_inv.inverse();
        const angle = 2 * Math.PI * length;
        this.quaternion.set(this.delta2.y * Math.sin(angle/2), -this.delta2.x * Math.sin(angle/2), 0.0, Math.cos(angle/2));
        this.quaternion.normalize();
        this.camera.multiply(this.quaternion).multiply(this.camera_inv);
        this.quaternion.copy(this.camera);
        return this.quaternion;
    }

    apply_rotation(center: THREE.Vector3, objects: THREE.Object3D[], selected: number[]){
        for(const i of selected){
            this.delta3.copy(center).sub(objects[i].position);
            objects[i].position.add(this.delta3);
            objects[i].applyQuaternion(this.quaternion);
            this.delta3.applyQuaternion(this.quaternion);
            objects[i].position.sub(this.delta3);
        }
    }
}