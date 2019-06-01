declare class MouseTracker {
    old: THREE.Vector2;
    new: THREE.Vector2;
    delta: THREE.Vector2;
    canvas: HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement);
    track(event: MouseEvent): void;
}
