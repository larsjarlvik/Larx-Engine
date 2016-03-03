/* global Shaders */

var DefaultShader = function (ctx) {
    this.ctx = ctx;
    this.shaders = undefined;
    this.shader = undefined;
    
    this.clip = {
        above: 1,
        below: 2
    }
};

DefaultShader.prototype.load = function() {
    var deferred = Q.defer();
    var self = this;
    var gl = this.ctx.gl;
    
    this.shaders = new Shaders(this.ctx);
    this.shaders.downloadShaderProgram('default').then(function (shaderProgram) {    
        self.shader = shaderProgram;
        
        gl.linkProgram(self.shader);
        gl.useProgram(self.shader);
        
        // START BUFFERS
        self.shader.vertexColorAttribute = gl.getAttribLocation(self.shader, 'aVertexColor');
        self.shader.vertexNormalAttribute = gl.getAttribLocation(self.shader, 'aVertexNormal');
        // END BUFFERS
        
        self.shader.fogDensity = gl.getUniformLocation(self.shader, 'uFogDensity');
        self.shader.fogGradient = gl.getUniformLocation(self.shader, 'uFogGradient');
        self.shader.fogColor = gl.getUniformLocation(self.shader, 'uFogColor');
        
        self.shader.opacity = gl.getUniformLocation(self.shader, 'uOpacity');
        
        self.shader.clipPlane = gl.getUniformLocation(self.shader, 'uClipPlane');
        self.shader.clipPlaneLevel = gl.getUniformLocation(self.shader, 'uClipPlaneLevel');
        
        self.shaders.setDefaults(self.shader, true);
        
        deferred.resolve();
    }).catch(function (e) {
        console.error(e);
    });
    
    return deferred.promise;
};

DefaultShader.prototype.get = function() {
    return this.shader;
}; 

DefaultShader.prototype.use = function() {
    this.ctx.gl.useProgram(this.shader);
    this.ctx.gl.enableVertexAttribArray(this.shader.vertexColorAttribute);
    this.ctx.gl.enableVertexAttribArray(this.shader.vertexNormalAttribute);
}; 

DefaultShader.prototype.setClipPlane = function(clipPlane, clipPlaneLevel) {
    this.ctx.gl.uniform1i(this.shader.clipPlane, clipPlane);
    this.ctx.gl.uniform1f(this.shader.clipPlaneLevel, clipPlaneLevel);
};

DefaultShader.prototype.cleanUp = function() {
    this.ctx.gl.disableVertexAttribArray(this.shader.vertexColorAttribute);
    this.ctx.gl.disableVertexAttribArray(this.shader.vertexNormalAttribute);
};

DefaultShader.prototype.setFog = function(density, gradient, color) {
    this.ctx.gl.uniform1f(this.shader.fogDensity, density);
    this.ctx.gl.uniform1f(this.shader.fogGradient, gradient);
    this.ctx.gl.uniform3f(this.shader.fogColor, color[0], color[1], color[2]);
};