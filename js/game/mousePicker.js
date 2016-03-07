Larx.MousePicker = {
    
    init: function(precision) {
        var res = Math.pow(2, precision);
        
        this.capture;
        this.mouse;
        
        this.width = res;
        this.height = res;
        
        this.buffer = new Larx.Framebuffer(this.width, this.height);
        this.buffer.buildColorBuffer(Larx.gl.FLOAT);
        this.pixels = new Float32Array(4);
    },
    
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
        
        model.render(shader);
        
        if (this.mouse && Larx.gl.checkFramebufferStatus(Larx.gl.FRAMEBUFFER) == Larx.gl.FRAMEBUFFER_COMPLETE) {
            Larx.gl.readPixels(this.mouse.x, this.mouse.y, 1, 1, Larx.gl.RGBA, Larx.gl.FLOAT, this.pixels);
        }
        
        this.buffer.unbind();
    },

    updateMouse: function() {
        this.mouse = {
            x: (Larx.Viewport.mouse.x / Larx.gl.viewportWidth * this.width),
            y: this.height - (Larx.Viewport.mouse.y / Larx.gl.viewportHeight * this.height)
        };
    },

    getCoordinates: function() {
        if(this.pixels[0] === 0.0 && this.pixels[2] === 0.0) {
            return [0, 0];
        }
        
        return [this.pixels[0], this.pixels[2]];
    }
};
