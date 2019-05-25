interface ElementalValue {
    H: number;
    Pt: number;
    [key: string]: number;
}
declare const color: ElementalValue;
declare const radius: ElementalValue;
interface Atom {
    n: string;
    x: number;
    y: number;
    z: number;
}
interface Input {
    cell?: Array<Array<number>>;
    atoms: Array<Atom>;
}
declare class Visualizer {
    canvas: HTMLCanvasElement;
    input: Array<Input>;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    camera_light: THREE.Light;
    raycaster: THREE.Raycaster;
    meshes: Array<THREE.Mesh>;
    index: number;
    look: THREE.Vector3;
    mouse_is_down: boolean;
    draged_atom?: THREE.Object3D;
    draged_index: number;
    plane: THREE.Plane;
    intersection: THREE.Vector3;
    offset: THREE.Vector3;
    mouse: THREE.Vector2;
    constructor(canvas: HTMLCanvasElement);
    sync_camera_light(): void;
    tick(): void;
    onresize(_: any): void;
    ondrop(event: any): void;
    onwheel(event: WheelEvent): void;
    onmousedown(event: MouseEvent): void;
    grab(intersects: THREE.Intersection[]): void;
    onmousemove(event: MouseEvent): void;
    onmouseup(event: MouseEvent): void;
    download(): void;
    set_mouse_position(event: MouseEvent): void;
    rotate(event: MouseEvent): void;
    drag(event: MouseEvent): void;
    clear(): void;
    draw_atoms(): void;
    draw_cell(): void;
}
declare function array_to_vector(array: Array<number>): THREE.Vector3;
declare function arrow_helper(s: THREE.Vector3, e: THREE.Vector3, hex: number, headLength: number, headWidth: number): THREE.ArrowHelper;
