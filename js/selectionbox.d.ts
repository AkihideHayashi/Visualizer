declare class SelectionBox {
    camera: THREE.Camera;
    scene: THREE.Scene;
    deep: number;
    startPoint: THREE.Vector3;
    endPoint: THREE.Vector3;
    collection: Array<THREE.Mesh>;
    constructor(camera: THREE.Camera, scene: THREE.Scene, deep?: number);
    select(): THREE.Mesh[];
    createFrustum(): THREE.Frustum;
    searchChildInFrustum(frustum: any, object: any): void;
}
declare class SelectionHelper {
    selectionBox: SelectionBox;
    renderer: THREE.Renderer;
    cssClassName: string;
    element: HTMLDivElement;
    startPoint: any;
    pointTopLeft: any;
    pointBottomRight: any;
    constructor(selectionBox: SelectionBox, renderer: THREE.Renderer, cssClassName: string);
    selectStart(event: MouseEvent): void;
    selectMove(event: MouseEvent): void;
    selectOver(_: MouseEvent): void;
}
