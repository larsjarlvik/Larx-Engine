
Larx.Cursor = function() {
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
    this.cursorSize;
};

Larx.Cursor.prototype = {
    buildCursor: function(terrain, size, pos) { 
        if(size[0] > size[2]) {
            this.cursorSize = size[0] / 2.0 + 0.5;
        } else {
            this.cursorSize = size[2] / 2.0 + 0.5;
        }
        
        this.model.vertices = [
            -this.cursorSize, 0.0, -this.cursorSize,
            -this.cursorSize, 0.0,  this.cursorSize,
            this.cursorSize, 0.0,  this.cursorSize,
            this.cursorSize, 0.0, -this.cursorSize
        ];
        
        this.model.rotate(terrain.getAngle(pos[0], pos[2], size[0], size[2]));
        this.model.bindBuffers();
    },
    
    render: function(shader, terrain, pos, size) {
        if(!pos) { return; }
            
        //this.buildCursor(terrain, size, pos);
         
        Larx.Matrix.push();
        Larx.Matrix.setIdentity();           
        Larx.Matrix.translate(pos);
        Larx.Matrix.setUniforms(shader);
        
        Larx.gl.disable(Larx.gl.DEPTH_TEST);
        
        shader.setColor(this.color);
        shader.setRadius(this.cursorSize / 2);
        
        this.model.render(shader);
        
        Larx.Matrix.pop();
        Larx.gl.enable(Larx.gl.DEPTH_TEST);
    },
    
    constructor: Larx.Cursor
};