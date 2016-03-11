"use strict";

class LarxCursor {
    constructor(terrain) {        
        this.model = new LarxModel('cursor');
        this.model.indices = [
            0, 1, 2,     
            3, 0, 2
        ];
        
        this.model.texCoords = [
            0, 0,
            0, 1,
            1, 1,
            1, 0
        ];
    
        this.color;
        this.cursorSize = [2.0, 2.0];
        this.buildCursor();
        this.terrain = terrain;
    }
    
    buildCursor() {
        this.model.vertices = [
            -this.cursorSize[0], 0.0, -this.cursorSize[1],
            -this.cursorSize[0], 0.0,  this.cursorSize[1],
            this.cursorSize[0], 0.0,  this.cursorSize[1],
            this.cursorSize[0], 0.0, -this.cursorSize[1]
        ];
        
        this.model.bindBuffers();
    }
    
    render(shader, pos) {
        if(!pos) { return; }
        
        
        let angles = this.terrain.getAngle(pos[0], pos[2], this.cursorSize[0], this.cursorSize[1]);
        
        
        Larx.Matrix.push();
        Larx.Matrix.setIdentity();      
        Larx.Matrix.translate(pos);
        Larx.Matrix.rotate(angles[0], [1, 0, 0]);       
        Larx.Matrix.rotate(angles[2], [0, 0, 1]);     
        Larx.Matrix.setUniforms(shader);
        
        Larx.gl.disable(Larx.gl.DEPTH_TEST);
        
        this.model.render(shader);
        
        Larx.Matrix.pop();
        Larx.gl.enable(Larx.gl.DEPTH_TEST);
    }
}