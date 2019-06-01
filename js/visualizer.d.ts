/// <reference path="input.d.ts" />
/// <reference path="objects.d.ts" />
/// <reference path="mousetracker.d.ts" />
/// <reference path="selectionbox.d.ts" />
/// <reference path="intersection.d.ts" />
declare const mode: {
    normal: number;
    select: number;
    rotate_camera: number;
    translate_camera: number;
    rotate_atoms: number;
    translate_atoms: number;
};
declare function array_to_vector(array: Array<number>): THREE.Vector3;
declare function vector_to_array(vector: THREE.Vector3): number[];
declare function clear(array: Array<any>): void;
declare class Visualizer {
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    objects: Objects;
    strobe: THREE.Light;
    look: THREE.Vector3;
    center: THREE.Vector3;
    input_manager: InputManager;
    selection_box: SelectionBox;
    selection_box_helper: SelectionHelper;
    selected_atoms: number[];
    intersection: Intersection;
    translate_center: THREE.Vector3;
    translate_camera_init: THREE.Vector3;
    constructor(canvas: HTMLCanvasElement, cssClassName: string, deep: number);
    input: Input;
    prepare_objects(): void;
    prepare_scene(): void;
    render(): void;
    onresize(): void;
    rotate_camera(mouse: MouseTracker): void;
    rotate_atoms(mouse: MouseTracker): void;
    grabable(mouse: THREE.Vector2): boolean;
    translate(delta: THREE.Vector2): void;
    start_translate(mouse: MouseTracker): void;
    translate_atoms(mouse: MouseTracker): void;
    translate_camera(mouse: MouseTracker): void;
    zoom(delta: number): void;
    open_selection(event: MouseEvent, mouse: THREE.Vector2): void;
    move_selection(event: MouseEvent, mouse: THREE.Vector2): void;
    over_selection(event: MouseEvent, mouse: THREE.Vector2): void;
    single_selection(_: MouseEvent, mouse: THREE.Vector2): void;
    sync_input_to_objects(): void;
    next(): void;
    prev(): void;
}
