Larx.Fxaa = {
    framebuffer: undefined,
    shader: undefined,
    model: undefined,
    
    init: function () {
        var deferred = Q.defer();
        
        this.framebuffer = new Larx.Framebuffer(Larx.gl.viewportWidth, Larx.gl.viewportHeight);
        this.framebuffer.buildColorBuffer(Larx.gl.UNSIGNED_BYTE, true);
        
        this.model = new Larx.Model();
        this.model.vertices = [
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
        ];
        
        this.model.indices = [ 0, 1, 2, 0, 2, 3 ];
        this.model.bindBuffers();
        
        this.shader = new Larx.FxaaShader();
        this.shader.load().then(function () {
            deferred.resolve();
        });
        
        return deferred.promise;
    },
    
    bind: function () {
        Larx.gl.viewport(0, 0, Larx.Viewport.canvas.width, Larx.Viewport.canvas.height);
        this.framebuffer.bindColorTexture(Larx.gl.TEXTURE3)
        this.framebuffer.bind(false); 
    },
    
    draw: function () {
        Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, null);
        Larx.gl.disable(Larx.gl.DEPTH_TEST);   
        
        this.shader.use();
        this.shader.setResolution(Larx.gl.viewportWidth, Larx.gl.viewportHeight);
        this.shader.setTexture(3);
        
        this.model.render(this.shader);
    }
};