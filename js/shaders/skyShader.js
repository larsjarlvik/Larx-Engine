var SkyShader = function (ctx) {
    this.ctx = ctx;
    this.shaders = undefined;
    this.shader = undefined;
};

SkyShader.prototype.load = function() {
    var deferred = Q.defer();
    var self = this;
    var gl = this.ctx.gl;
    
    this.shaders = new Shaders(this.ctx);
    this.shaders.downloadShaderProgram('sky').then(function (shaderProgram) {    
        self.shader = shaderProgram;
        
        gl.linkProgram(self.shader);
        gl.useProgram(self.shader);
        
        // START BUFFERS
        self.shader.textureCoordAttribute = gl.getAttribLocation(self.shader, 'aTextureCoord');
        // END BUFFERS
        
        self.shader.stop1 = gl.getUniformLocation(self.shader, 'uStop1');
        self.shader.stop2 = gl.getUniformLocation(self.shader, 'uStop2');
        self.shader.stop3 = gl.getUniformLocation(self.shader, 'uStop3');
        
        self.shaders.setDefaults(self.shader, false);
        
        deferred.resolve();
    }).catch(function (e) {
        console.error(e);
    });
    
    return deferred.promise;
};

SkyShader.prototype.get = function() {
    return this.shader;
}; 

SkyShader.prototype.use = function() {
    this.ctx.gl.useProgram(this.shader);
    this.ctx.gl.enableVertexAttribArray(this.shader.textureCoordAttribute);
}; 

SkyShader.prototype.cleanUp = function() {
    this.ctx.gl.disableVertexAttribArray(this.shader.textureCoordAttribute);
};

SkyShader.prototype.setColorStop1 = function(color) {
    this.ctx.gl.uniform3f(this.shader.stop1, color[0], color[1], color[2]);
};

SkyShader.prototype.setColorStop2 = function(color) {
    this.ctx.gl.uniform3f(this.shader.stop2, color[0], color[1], color[2]);
};

SkyShader.prototype.setColorStop3 = function(color) {
    this.ctx.gl.uniform3f(this.shader.stop3, color[0], color[1], color[2]);
};