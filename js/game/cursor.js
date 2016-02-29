var Cursor = function(ctx) {
    this.ctx = ctx;
    this.model = new Model(this.ctx, 'cursor');
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
    
    this.texture;
    this.color;
    this.cursorSize;
};

Cursor.prototype._buildCursor = function(terrain, size, pos) { 
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
};

Cursor.prototype.render = function(shader, terrain, pos, size) {
    if(!pos) { return; }
    
    this._buildCursor(terrain, size, pos);
    
    
    this.ctx.matrix.push();
    this.ctx.matrix.setIdentity();
    this.ctx.matrix.translate(pos);
    this.ctx.matrix.setUniforms(shader);
    this.ctx.gl.enable(this.ctx.gl.BLEND);
    this.ctx.gl.disable(this.ctx.gl.DEPTH_TEST);
    
    shader.setColor(this.color);
    shader.setRadius(this.cursorSize / 2);
    
    this.model.render(shader);
    
    this.ctx.matrix.pop();
    this.ctx.gl.disable(this.ctx.gl.BLEND);
    this.ctx.gl.enable(this.ctx.gl.DEPTH_TEST);
};