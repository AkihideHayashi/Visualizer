"use strict";
class InputManager {
    constructor() {
        this.input = { element: {}, atoms: [] };
        this.frame = 0;
    }
    get atoms() {
        return this.input.atoms[this.frame].atoms;
    }
    get cell() {
        return this.input.atoms[this.frame].cell;
    }
    next() {
        if (this.frame < this.input.atoms.length - 1) {
            this.frame += 1;
        }
    }
    prev() {
        if (this.frame > 0) {
            this.frame -= 1;
        }
    }
}
//# sourceMappingURL=input.js.map