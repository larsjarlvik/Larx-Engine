Larx.MousePicker = function(precision) {
    this.capture;
    this.mouse;
    this.objects = [];
    this.precision = precision;
    
    this.width = Larx.gl.viewportWidth * this.precision;
    this.height = Larx.gl.viewportHeight * this.precision;
    
    this.buffer = new Larx.Framebuffer(this.width, this.height);
    this.buffer.buildColorBuffer(Larx.gl.FLOAT);
    
    this.pixels = new Float32Array(4);
    
    var self = this;
    
    Larx.Viewport.onResize(function () {
        self.width = Larx.gl.viewportWidth * self.precision;
        self.height = Larx.gl.viewportHeight * self.precision;
    
        self.buffer.width = self.width;
        self.buffer.height = self.height;
        self.buffer.build();
    });
};

Larx.MousePicker.prototype = {
    addObject: function(b, data) {
        var box = new Model('box');
        
        b.vMin[0] -= 0.4;
        b.vMax[0] += 0.4;
        b.vMin[2] -= 0.4;
        b.vMax[2] += 0.4;
        
        box.vertices = [
            b.vMin[0], b.vMin[1], b.vMax[2],
            b.vMax[0], b.vMin[1], b.vMax[2],
            b.vMax[0], b.vMax[1], b.vMax[2],
            b.vMin[0], b.vMax[1], b.vMax[2],
            b.vMin[0], b.vMin[1], b.vMin[2],
            b.vMin[0], b.vMax[1], b.vMin[2],
            b.vMax[0], b.vMax[1], b.vMin[2],
            b.vMax[0], b.vMin[1], b.vMin[2],
            b.vMin[0], b.vMax[1], b.vMin[2],
            b.vMin[0], b.vMax[1], b.vMax[2],
            b.vMax[0], b.vMax[1], b.vMax[2],
            b.vMax[0], b.vMax[1], b.vMin[2],
            b.vMin[0], b.vMin[1], b.vMin[2],
            b.vMax[0], b.vMin[1], b.vMin[2],
            b.vMax[0], b.vMin[1], b.vMax[2],
            b.vMin[0], b.vMin[1], b.vMax[2],
            b.vMax[0], b.vMin[1], b.vMin[2],
            b.vMax[0], b.vMax[1], b.vMin[2],
            b.vMax[0], b.vMax[1], b.vMax[2],
            b.vMax[0], b.vMin[1], b.vMax[2],
            b.vMin[0], b.vMin[1], b.vMin[2],
            b.vMin[0], b.vMin[1], b.vMax[2],
            b.vMin[0], b.vMax[1], b.vMax[2],
            b.vMin[0], b.vMax[1], b.vMin[2]
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
            data: data
        });
    },

    render: function(shader, model) {
        this.buffer.bind();
        Larx.Matrix.setIdentity();
        Larx.Matrix.setUniforms(shader);
        
        shader.setColorId(-10);
        model.render(shader);
        
        for(var i = 0; i < this.objects.length; i++) {
            shader.setColorId(i);
            this.objects[i].model.render(shader);
        }
        
        if (this.mouse && Larx.gl.checkFramebufferStatus(Larx.gl.FRAMEBUFFER) == Larx.gl.FRAMEBUFFER_COMPLETE) {
            Larx.gl.readPixels(this.mouse.x, this.mouse.y, 1, 1, Larx.gl.RGBA, Larx.gl.FLOAT, this.pixels);
        }
        
        this.buffer.unbind();
    },

    updateMouse: function(mx, my) {
        this.mouse = {
            x: mx * this.precision,
            y: this.height - (my * this.precision)
        };
    },

    getCoordinates: function() {
        if(!this.pixels || this.pixels[0] === -1 || 
        (this.pixels[0] === 0.0 && this.pixels[1] === 0.0 && this.pixels[2] === 0.0)) {
            return undefined;
        }
        
        return [this.pixels[0], this.pixels[1], this.pixels[2]];
    },

    getObject: function() {
        if(!this.pixels || this.pixels[0] !== -1) {
            return undefined;
        }
        
        return this.objects[this.pixels[1]].data;
    }
};