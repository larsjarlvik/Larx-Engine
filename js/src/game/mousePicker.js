"use strict";

class LarxMousePicker {
    constructor(terrain, precision) {
        this.terrain = terrain;
        this.capture;
        this.mouse;
        
        this.size = Math.pow(2, precision);
        
        this.buffer = new LarxFramebuffer(this.size, this.size);
        this.buffer.buildColorBuffer(Larx.gl.FLOAT, true);
        this.pixels = new Float32Array(4);
    }
    
    render(shader) {
        this.buffer.bind(true);
        Larx.Matrix.setUniforms(shader);
        
        this.terrain.render(shader);
        
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
            x: (Larx.Viewport.mouse.x / Larx.gl.viewportWidth * this.size),
            y: this.size - (Larx.Viewport.mouse.y / Larx.gl.viewportHeight * this.size)
        };
    }

    getCoordinates() {
        if(this.pixels[0] === 0.0 && this.pixels[2] === 0.0) {
            return [0, 0];
        }
        
        return [this.pixels[0], this.pixels[1], this.pixels[2]];
    }
}
