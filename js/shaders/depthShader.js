var DepthShader = function (ctx) {
    this.ctx = ctx;
    this.shaders = undefined;
    this.shader = undefined;
};

DepthShader.prototype.load = function() {
    var deferred = Q.defer();
    var self = this;
    var gl = this.ctx.gl;
    
    this.shaders = new Shaders(this.ctx);
    this.shaders.downloadShaderProgram('depth').then(function (shaderProgram) {    
        self.shader = shaderProgram;
        
        gl.linkProgram(self.shader);
        gl.useProgram(self.shader);
        
        // START BUFFERS
        self.shader.vertexColorAttribute = gl.getAttribLocation(self.shader, 'aVertexColor');
        self.shader.vertexNormalAttribute = gl.getAttribLocation(self.shader, 'aVertexNormal');
        // END BUFFERS
        
        self.shaders.setDefaults(self.shader, true);
        
        deferred.resolve();
    }).catch(function (e) {
        console.error(e);
    });
    
    return deferred.promise;
};

DepthShader.prototype.get = function() {
    return this.shader;
}; 

DepthShader.prototype.use = function() {
    this.ctx.gl.useProgram(this.shader);
    this.ctx.gl.enableVertexAttribArray(this.shader.vertexColorAttribute);
    this.ctx.gl.enableVertexAttribArray(this.shader.vertexNormalAttribute);
}; 

DepthShader.prototype.cleanUp = function() {
    this.ctx.gl.disableVertexAttribArray(this.shader.vertexColorAttribute);
    this.ctx.gl.disableVertexAttribArray(this.shader.vertexNormalAttribute);
};