declare function chain_mesh(mesheses: THREE.Mesh[][]): IterableIterator<THREE.Mesh>;
declare class Objects {
    atoms: THREE.Mesh[];
    cells: THREE.ArrowHelper[];
    bonds: THREE.Mesh[];
    constructor();
    readonly objects: IterableIterator<THREE.Mesh>;
    add_atom(radius: number, color: number, x: number, y: number, z: number): void;
    clear(): void;
    atom_number(mesh: THREE.Object3D): number;
    center(selection: number[], r: THREE.Vector3): THREE.Vector3;
    set_emissive(selected: number[], color: number): void;
}
declare function set_emissive(material: THREE.Material | THREE.Material[], color: number): void;
