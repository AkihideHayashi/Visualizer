
/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />

class MouseTracker{
  old: THREE.Vector2;
  new: THREE.Vector2;
  delta: THREE.Vector2;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement){
    this.canvas = canvas;
    this.old = new THREE.Vector2();
    this.new = new THREE.Vector2();
    this.delta = new THREE.Vector2();
  }

  track(event: MouseEvent){
    const element = this.canvas;
    const x = event.clientX - element.offsetLeft;
    const y = event.clientY - element.offsetTop;
    const w = element.offsetWidth; // it may be window.innerWidth
    const h = element.offsetHeight;
    this.old.copy(this.new);
    this.new.set((x / w) * 2 - 1, -(y / h) * 2 + 1);
    this.delta.copy(this.new);
    this.delta.sub(this.old);
  }
}
