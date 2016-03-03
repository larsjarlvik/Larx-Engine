var WaterShader = function (ctx) {
    this.ctx = ctx;
    this.shaders = undefined;
    this.shader = undefined;
};

WaterShader.prototype.load = function() {
    var deferred = Q.defer();
    var self = this;
    var gl = this.ctx.gl;
    
    this.shaders = new Shaders(this.ctx);
    
    this.shaders.downloadShaderProgram('water').then(function (shaderProgram) {    
        self.shader = shaderProgram;
        
        gl.linkProgram(self.shader);
        gl.useProgram(self.shader);
        
        self.buffers = {};
        self.shader.vertexNormalAttribute = gl.getAttribLocation(self.shader, 'aVertexNormal');
        
        self.shader.color = gl.getUniformLocation(self.shader, 'uColor');
        self.shader.deepColor = gl.getUniformLocation(self.shader, 'uDeepColor');
        
        self.shader.distortion = gl.getUniformLocation(self.shader, 'uDistortion');
        self.shader.opacity = gl.getUniformLocation(self.shader, 'uOpacity');
        
        self.shader.refractionDepthTexture = gl.getUniformLocation(self.shader, 'uRefractionDepthTexture');
        self.shader.refractionColorTexture = gl.getUniformLocation(self.shader, 'uRefractionColorTexture');
        
        self.shader.reflectionColorTexture = gl.getUniformLocation(self.shader, 'uReflectionColorTexture');
        
        self.shader.fogDensity = gl.getUniformLocation(self.shader, 'uFogDensity');
        self.shader.fogGradient = gl.getUniformLocation(self.shader, 'uFogGradient');
        self.shader.fogColor = gl.getUniformLocation(self.shader, 'uFogColor');
        
        self.shaders.setDefaults(self.shader, true);
        
        deferred.resolve();
    }).catch(function (e) {
        console.error(e);
    });
    
    return deferred.promise;
};

WaterShader.prototype.get = function() {
    return this.shader;
}; 

WaterShader.prototype.use = function() {
    this.ctx.gl.useProgram(this.shader);
    this.ctx.gl.enableVertexAttribArray(this.shader.vertexNormalAttribute);
}; 

WaterShader.prototype.cleanUp = function() {
    this.ctx.gl.disableVertexAttribArray(this.shader.vertexNormalAttribute);
};

WaterShader.prototype.setWaterColor = function(color) {
    this.ctx.gl.useProgram(this.shader);
    this.ctx.gl.uniform3f(this.shader.color, color[0], color[1], color[2]);
};

WaterShader.prototype.setRefractionDepthTexture = function() {
    this.ctx.gl.uniform1i(this.shader.refractionDepthTexture, 0);  
};

WaterShader.prototype.setRefractionColorTexture = function() {
    this.ctx.gl.uniform1i(this.shader.refractionColorTexture, 1);  
};

WaterShader.prototype.setReflectionColorTexture = function() {
    this.ctx.gl.uniform1i(this.shader.reflectionColorTexture, 2);  
};


WaterShader.prototype.setDistortion = function(value) {
    this.ctx.gl.uniform1f(this.shader.distortion, value);  
};

WaterShader.prototype.setFog = function(density, gradient, color) {
    this.ctx.gl.uniform1f(this.shader.fogDensity, density);
    this.ctx.gl.uniform1f(this.shader.fogGradient, gradient);
    this.ctx.gl.uniform3f(this.shader.fogColor, color[0], color[1], color[2]);
};