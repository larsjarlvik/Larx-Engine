/* global Larx */

Larx.Cursor = function(terrain) {
    this.model = new Larx.Model('cursor');
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
    this.cursorSize = [1.0, 1.0];
    this.buildCursor();
    this.terrain = terrain;
};

Larx.Cursor.prototype = {
    buildCursor: function() {
        this.model.vertices = [
            -this.cursorSize, 0.0, -this.cursorSize,
            -this.cursorSize, 0.0,  this.cursorSize,
            this.cursorSize, 0.0,  this.cursorSize,
            this.cursorSize, 0.0, -this.cursorSize
        ];
        
        this.model.bindBuffers();
    },
    
    render: function(shader, pos, size) {
        if(!pos) { return; }
            
        //this.model.rotate(this.terrain.getAngle(pos[0], pos[2], this.cursorSize[0], this.cursorSize[2]));
        
        Larx.Matrix.push();
        Larx.Matrix.setIdentity();           
        Larx.Matrix.translate(pos);
        Larx.Matrix.setUniforms(shader);
        
        Larx.gl.disable(Larx.gl.DEPTH_TEST);
        
        this.model.render(shader);
        
        Larx.Matrix.pop();
        Larx.gl.enable(Larx.gl.DEPTH_TEST);
    },
    
    constructor: Larx.Cursor
};