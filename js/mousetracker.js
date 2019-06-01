"use strict";
class MouseTracker {
    constructor(canvas) {
        this.canvas = canvas;
        this.old = new THREE.Vector2();
        this.new = new THREE.Vector2();
        this.delta = new THREE.Vector2();
    }
    track(event) {
        const element = this.canvas;
        const x = event.clientX - element.offsetLeft;
        const y = event.clientY - element.offsetTop;
        const w = element.offsetWidth;
        const h = element.offsetHeight;
        this.old.copy(this.new);
        this.new.set((x / w) * 2 - 1, -(y / h) * 2 + 1);
        this.delta.copy(this.new);
        this.delta.sub(this.old);
    }
}
//# sourceMappingURL=mousetracker.js.map