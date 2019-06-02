/// <reference path="common.d.ts" />
declare function build_cell(cell: number[][], hexes: number[], headLengthRatio: number, headWidthRatio: number): THREE.ArrowHelper[];
declare function new_arrow_helper(start: THREE.Vector3, end: THREE.Vector3, hex: number, headLengthRation: number, headWidthRatio: number): THREE.ArrowHelper;
