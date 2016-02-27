var DefaultShader = function (ctx) {
    this.ctx = ctx;
    this.shaders = undefined;
    this.shader = undefined;
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
        self.shader.vertexPositionAttribute = gl.getAttribLocation(self.shader, 'aVertexPosition');
        gl.enableVertexAttribArray(self.shader.vertexPositionAttribute);
        
        self.shader.vertexColorAttribute = gl.getAttribLocation(self.shader, 'aVertexColor');
        gl.enableVertexAttribArray(self.shader.vertexColorAttribute);
        
        self.shader.vertexNormalAttribute = gl.getAttribLocation(self.shader, 'aVertexNormal');
        gl.enableVertexAttribArray(self.shader.vertexNormalAttribute);
        // END BUFFERS
        
        self.shader.opacity = gl.getUniformLocation(self.shader, 'uOpacity');
        self.shader.waterColor = gl.getUniformLocation(self.shader, 'uWaterColor');
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
}; 

DefaultShader.prototype.setWaterColor = function(color) {
    this.ctx.gl.useProgram(this.shader);
    this.ctx.gl.uniform3f(this.shader.waterColor, color[0], color[1], color[2]);
};