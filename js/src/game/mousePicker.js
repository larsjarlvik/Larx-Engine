"use strict";

class LarxMousePicker {
    constructor(precision) {
        let res = Math.pow(2, precision);
        
        this.capture;
        this.mouse;
        
        this.width = res;
        this.height = res;
        
        this.buffer = new LarxFramebuffer(this.width, this.height);
        this.buffer.buildColorBuffer(Larx.gl.FLOAT);
        this.pixels = new Float32Array(4);
    }
    
    render(shader, model) {
        this.buffer.bind();
        Larx.Matrix.setIdentity();
        Larx.Matrix.setUniforms(shader);
        
        model.render(shader);
        
        if (this.mouse && Larx.gl.checkFramebufferStatus(Larx.gl.FRAMEBUFFER) == Larx.gl.FRAMEBUFFER_COMPLETE) {
            Larx.gl.readPixels(this.mouse.x, this.mouse.y, 1, 1, Larx.gl.RGBA, Larx.gl.FLOAT, this.pixels);
        }
        
        this.buffer.unbind();
    }

    updateMouse() {
        if (Larx.Viewport.mouse.x <= 0 || Larx.Viewport.mouse.x >= Larx.gl.viewportWidth ||
            Larx.Viewport.mouse.y <= 0 || Larx.Viewport.mouse.y >= Larx.gl.viewportHeight) {
            this.mouse = undefined;
            return;
        }
        
        this.mouse = {
            x: (Larx.Viewport.mouse.x / Larx.gl.viewportWidth * this.width),
            y: this.height - (Larx.Viewport.mouse.y / Larx.gl.viewportHeight * this.height)
        };
    }

    getCoordinates() {
        if(this.pixels[0] === 0.0 && this.pixels[2] === 0.0) {
            return [0, 0];
        }
        
        return [this.pixels[0], this.pixels[2]];
    }
}
