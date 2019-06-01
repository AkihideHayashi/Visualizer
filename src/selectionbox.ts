
/**
 * @author akhdhys / https://akhdhys.github.io
**/

/// <reference path="../node_modules/three/src/Three.d.ts" />


class SelectionBox{
    camera: THREE.Camera;
    scene: THREE.Scene;
    deep: number;
    startPoint: THREE.Vector3;
    endPoint: THREE.Vector3;
    collection: Array<THREE.Mesh>;
    constructor (camera: THREE.Camera, scene: THREE.Scene, deep?: number){
        this.camera = camera;
        this.scene = scene;
        this.startPoint = new THREE.Vector3();
        this.endPoint = new THREE.Vector3();
        this.collection = [];
        if(deep){
            this.deep = deep;
        }else{
            this.deep = Number.MAX_VALUE;
        }
    }
    // select(startPoint: THREE.Vector3 | null, endPoint: THREE.Vector3 | null){
        // this.startPoint = startPoint || this.startPoint;
        // this.endPoint = endPoint || this.endPoint;
    select(){
        this.collection = [];
        // var boxSelectionFrustum = this.createFrustum( this.startPoint, this.endPoint );
        var boxSelectionFrustum = this.createFrustum();
        this.searchChildInFrustum( boxSelectionFrustum, this.scene );
        return this.collection;
    }

    // createFrustum(startPoint: THREE.Vector3 | null, endPoint: THREE.Vector3 | null){
    //     startPoint = startPoint || this.startPoint;
    //     endPoint = endPoint || this.endPoint
    createFrustum(){
        let tmpPoint = this.startPoint.clone();
        tmpPoint.x = Math.min(this.startPoint.x, this.endPoint.x);
        tmpPoint.y = Math.max(this.startPoint.y, this.endPoint.y);
        this.endPoint.x = Math.max(this.startPoint.x, this.endPoint.x);
        this.endPoint.y = Math.min(this.startPoint.y, this.endPoint.y);
        var vecNear = this.camera.position.clone();
        var vecTopLeft = tmpPoint.clone();
        var vecTopRight = new THREE.Vector3( this.endPoint.x, tmpPoint.y, 0 );
        var vecDownRight = this.endPoint.clone();
        var vecDownLeft = new THREE.Vector3( tmpPoint.x, this.endPoint.y, 0 );
        vecTopLeft.unproject( this.camera );
        vecTopRight.unproject( this.camera );
        vecDownRight.unproject( this.camera );
        vecDownLeft.unproject( this.camera );
        
        var vectemp1 = vecTopLeft.clone().sub( vecNear );
        var vectemp2 = vecTopRight.clone().sub( vecNear );
        var vectemp3 = vecDownRight.clone().sub( vecNear );
        vectemp1.normalize();
        vectemp2.normalize();
        vectemp3.normalize();
        
        vectemp1.multiplyScalar( this.deep );
        vectemp2.multiplyScalar( this.deep );
        vectemp3.multiplyScalar( this.deep );
        vectemp1.add( vecNear );
        vectemp2.add( vecNear );
        vectemp3.add( vecNear );
        
        var planeTop = new THREE.Plane();
        planeTop.setFromCoplanarPoints( vecNear, vecTopLeft, vecTopRight );
        var planeRight = new THREE.Plane();
        planeRight.setFromCoplanarPoints( vecNear, vecTopRight, vecDownRight );
        var planeDown = new THREE.Plane();
        planeDown.setFromCoplanarPoints( vecDownRight, vecDownLeft, vecNear );
        var planeLeft = new THREE.Plane();
        planeLeft.setFromCoplanarPoints( vecDownLeft, vecTopLeft, vecNear );
        var planeFront = new THREE.Plane();
        planeFront.setFromCoplanarPoints( vecTopRight, vecDownRight, vecDownLeft );
        var planeBack = new THREE.Plane();
        planeBack.setFromCoplanarPoints( vectemp3, vectemp2, vectemp1 );
        planeBack.normal = planeBack.normal.multiplyScalar( -1 );
        
        return new THREE.Frustum( planeTop, planeRight, planeDown, planeLeft, planeFront, planeBack );
    }

    searchChildInFrustum(frustum: any, object: any){
        if ( object instanceof THREE.Mesh ) {
            if ( object.material !== undefined ) {
                object.geometry.computeBoundingSphere();
                var center = object.geometry.boundingSphere.center.clone().applyMatrix4( object.matrixWorld );
                if ( frustum.containsPoint( center ) ) {
                    this.collection.push( object );
                }
            }
        }
        if ( object.children.length > 0 ) {
            for ( var x = 0; x < object.children.length; x++ ) {
                this.searchChildInFrustum( frustum, object.children[x] );
            }
        }
    }
}


class SelectionHelper{
    selectionBox: SelectionBox;
    renderer: THREE.Renderer;
    cssClassName: string;
    element: HTMLDivElement;
    startPoint: any;
    pointTopLeft: any;
    pointBottomRight: any;
    constructor(selectionBox: SelectionBox, renderer: THREE.Renderer, cssClassName: string){
        this.element = document.createElement("div");
        this.element.classList.add(cssClassName);
        this.element.style.pointerEvents = "none";
        this.renderer = renderer;
        this.startPoint = { x: 0, y: 0 };
        this.pointTopLeft = { x: 0, y: 0 };
        this.pointBottomRight = { x: 0, y: 0 };
        this.selectionBox = selectionBox;
        this.cssClassName = cssClassName;
    }
    
    selectStart(event: MouseEvent){
        if(this.renderer.domElement.parentElement){
            this.renderer.domElement.parentElement.appendChild( this.element );
        }
        this.element.style.left = event.clientX + "px";
        this.element.style.top = event.clientY + "px";
        this.element.style.width = "0px";
        this.element.style.height = "0px";
    
        this.startPoint.x = event.clientX;
        this.startPoint.y = event.clientY;
    }

    selectMove(event: MouseEvent){
        this.pointBottomRight.x = Math.max( this.startPoint.x, event.clientX );
    	this.pointBottomRight.y = Math.max( this.startPoint.y, event.clientY );
    	this.pointTopLeft.x = Math.min( this.startPoint.x, event.clientX );
    	this.pointTopLeft.y = Math.min( this.startPoint.y, event.clientY );

    	this.element.style.left = this.pointTopLeft.x + "px";
    	this.element.style.top = this.pointTopLeft.y + "px";
    	this.element.style.width = ( this.pointBottomRight.x - this.pointTopLeft.x ) + "px";
    	this.element.style.height = ( this.pointBottomRight.y - this.pointTopLeft.y ) + "px";
    }

    selectOver(_: MouseEvent){
        if(this.element.parentElement){
            this.element.parentElement.removeChild( this.element );
        }
    }
    
}