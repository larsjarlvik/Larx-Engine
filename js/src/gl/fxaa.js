"use strict";

class LarxFxaa {
    constructor() {
        this.shader = undefined;        
        this.model = new LarxModel();
        this.model.vertices = [
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
        ];
        
        this.model.indices = [ 0, 1, 2, 0, 2, 3 ];
    }
    
    init() {
        let deferred = Q.defer();
        
        this.buildFramebuffer();
        this.model.bindBuffers();
        
        this.shader = new LarxFxaaShader();
        this.shader.load().then(function () {
            deferred.resolve();
        });
        
        return deferred.promise;
    }
    
    buildFramebuffer() {
        this.framebuffer = new LarxFramebuffer(Larx.gl.viewportWidth, Larx.gl.viewportHeight);
        this.framebuffer.buildColorBuffer(Larx.gl.UNSIGNED_BYTE, true);
    }
    
    bind() {
        Larx.gl.viewport(0, 0, Larx.Viewport.canvas.clientWidth, Larx.Viewport.canvas.clientHeight);
        this.framebuffer.bindColorTexture(Larx.gl.TEXTURE3)
        this.framebuffer.bind(false); 
    }
    
    draw() {
        Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, null);
        Larx.gl.disable(Larx.gl.DEPTH_TEST);   
        
        this.shader.use();
        this.shader.setResolution(Larx.gl.viewportWidth, Larx.gl.viewportHeight);
        this.shader.setTexture(3);
        
        this.model.render(this.shader);
    }
};