/// <reference path="common.d.ts" />
/// <reference path="input.d.ts" />
/// <reference path="objects.d.ts" />
/// <reference path="mousetracker.d.ts" />
/// <reference path="selectionbox.d.ts" />
/// <reference path="intersection.d.ts" />
/// <reference path="rotation.d.ts" />
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
    rotation: Rotation;
    constructor(canvas: HTMLCanvasElement, cssClassName: string, deep: number);
    set_input(input: Input): void;
    sync_input_to_objects(): void;
    sync_objects_to_input(selected: number[]): void;
    prepare_objects(): void;
    prepare_scene(): void;
    render(): void;
    onresize(): void;
    rotate_camera(mouse: MouseTracker): void;
    rotate_atoms(mouse: MouseTracker): void;
    grabable(mouse: THREE.Vector2): boolean;
    translate_atoms(mouse: MouseTracker): void;
    translate_camera(mouse: MouseTracker): void;
    zoom(delta: number): void;
    open_selection(event: MouseEvent, mouse: THREE.Vector2): void;
    move_selection(event: MouseEvent, mouse: THREE.Vector2): void;
    over_selection(event: MouseEvent, mouse: THREE.Vector2): void;
    single_selection(_: MouseEvent, mouse: THREE.Vector2): void;
    next(): void;
    prev(): void;
}
