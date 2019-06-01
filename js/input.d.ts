interface Atom {
    n: string;
    r: Array<number>;
}
interface Frame {
    cell?: Array<Array<number>>;
    atoms: Array<Atom>;
}
interface Property {
    color: number;
    radius: number;
}
interface Input {
    element: {
        [key: string]: Property;
    };
    atoms: Array<Frame>;
}
declare class InputManager {
    input: Input;
    frame: number;
    constructor();
    readonly atoms: Atom[];
    readonly cell: number[][] | undefined;
    next(): void;
    prev(): void;
}
