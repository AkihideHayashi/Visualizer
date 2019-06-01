
/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />
/// <reference path="../node_modules/\@types/file-saver/index.d.ts" />

interface Atom{
  n: string;
  r: Array<number>;
}

interface Frame{
  cell?: Array<Array<number>>;
  atoms: Array<Atom>;
}

interface Property{
  color: number;
  radius: number;
}

interface Input{
  element: {[key: string]: Property};
  atoms: Array<Frame>;
}

class InputManager{
    input: Input;
    frame: number;
    constructor(){
        this.input = {element: {}, atoms:[]};
        this.frame = 0;
    }
    get atoms(){
        return this.input.atoms[this.frame].atoms;
    }
    get cell(){
        return this.input.atoms[this.frame].cell;
    }
    next(){
      if(this.frame < this.input.atoms.length - 1){
        this.frame += 1;
      }
    }
    prev(){
      if(this.frame > 0){
        this.frame -= 1;
      }
    }

}
