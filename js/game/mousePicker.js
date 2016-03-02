var MousePicker = function(ctx, precision) {
    this.ctx = ctx;
    this.capture;
    this.mouse;
    this.objects = [];
    this.precision = precision;
    
    this.width = ctx.gl.viewportWidth * this.precision;
    this.height = ctx.gl.viewportHeight * this.precision;
    
    this.buffer = new Framebuffer(ctx, this.width, this.height);
    this.buffer.buildColorBuffer(ctx.gl.FLOAT);
    
    this.pixels = new Float32Array(4);
    
    var self = this;
    
    this.ctx.viewport.onResize(function () {
        self.width = ctx.gl.viewportWidth * self.precision;
        self.height = ctx.gl.viewportHeight * self.precision;
    
        self.buffer.width = self.width;
        self.buffer.height = self.height;
        self.buffer.build();
    });
};

MousePicker.prototype.addObject = function(model, pickId) {
    var b = model.getBounds();
    var box = new Model(this.ctx, 'box');
    
    b[0] -= 0.4;
    b[1] += 0.4;
    b[4] -= 0.4;
    b[5] += 0.4;
    
    box.vertices = [
        b[0], b[2], b[5],
        b[1], b[2], b[5],
        b[1], b[3], b[5],
        b[0], b[3], b[5],
        b[0], b[2], b[4],
        b[0], b[3], b[4],
        b[1], b[3], b[4],
        b[1], b[2], b[4],
        b[0], b[3], b[4],
        b[0], b[3], b[5],
        b[1], b[3], b[5],
        b[1], b[3], b[4],
        b[0], b[2], b[4],
        b[1], b[2], b[4],
        b[1], b[2], b[5],
        b[0], b[2], b[5],
        b[1], b[2], b[4],
        b[1], b[3], b[4],
        b[1], b[3], b[5],
        b[1], b[2], b[5],
        b[0], b[2], b[4],
        b[0], b[2], b[5],
        b[0], b[3], b[5],
        b[0], b[3], b[4]
    ];
    
    box.indices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    
    box.bindBuffers();
    this.objects.push({
        model: box,
        pickId: pickId
    });
};

MousePicker.prototype.render = function(shader, model) {
    this.buffer.bind();
    this.ctx.matrix.setIdentity();
    this.ctx.matrix.setUniforms(shader);
    
    shader.setColorId(-10);
    model.render(shader);
    
    for(var i = 0; i < this.objects.length; i++) {
        shader.setColorId(this.objects[i].pickId);
        this.objects[i].model.render(shader);
    }
    
    if (this.mouse && this.ctx.gl.checkFramebufferStatus(this.ctx.gl.FRAMEBUFFER) == this.ctx.gl.FRAMEBUFFER_COMPLETE) {
        this.ctx.gl.readPixels(this.mouse.x, this.mouse.y, 1, 1, this.ctx.gl.RGBA, this.ctx.gl.FLOAT, this.pixels);
    }
    
    this.buffer.unbind();
};

MousePicker.prototype.updateMouse = function(mx, my) {
    this.mouse = {
        x: mx * this.precision,
        y: this.height - (my * this.precision)
    };
};

MousePicker.prototype.getCoordinates = function() {
    if(!this.pixels || this.pixels[0] === -1 || 
      (this.pixels[0] === 0.0 && this.pixels[1] === 0.0 && this.pixels[2] === 0.0)) {
        return undefined;
    }
    
    return [this.pixels[0], this.pixels[1], this.pixels[2]];
};


MousePicker.prototype.getObjectId = function() {
    if(!this.pixels || this.pixels[0] !== -1) {
        return undefined;
    }
    
    return this.pixels[1];
};