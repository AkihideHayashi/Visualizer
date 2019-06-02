// /// <reference path="../node_modules/three/src/Three.d.ts" />

// class StrobeCamera{
//     camera: THREE.Camera;
//     strobe: THREE.Light;
//     quaternion: THREE.Quaternion;
//     constructor(camera: THREE.Camera, strobe: THREE.Light){
//         this.camera = camera;
//         this.strobe = strobe;
//     }
// }

// rotate_camera(mouse: MouseTracker){
// const delta = mouse.delta;
// const length = delta.length();
// delta.normalize();
// let angle = 2 * Math.PI * length;
// let quaternion = new THREE.Quaternion(delta.y * Math.sin(angle/2), -delta.x * Math.sin(angle/2), 0.0, Math.cos(angle/2));
// let quaternion_camera = this.camera.quaternion.clone();
// quaternion.normalize();
// quaternion_camera.normalize();
// let quaternion_camera_inverse = quaternion_camera.clone().inverse();
// let rot = quaternion_camera.multiply(quaternion).multiply(quaternion_camera_inverse);
// this.camera.applyQuaternion(rot);
// this.camera.position.add(this.look);
// this.look.applyQuaternion(rot);
// this.camera.position.sub(this.look);
// this.after_camera_move();
// }