var DefaultShader = function (gl) {
    this.gl = gl;
    this.shaders = undefined;
    this.shader = undefined;
};

DefaultShader.prototype.load = function(engine) {
   
    var deferred = Q.defer();
    var self = this;
    
    this.gl = engine.gl;
    this.shaders = new Shaders(this.gl);
    
    this.shaders.downloadShaderProgram('default').then(function (shaderProgram) {    
        self.shader = shaderProgram;
        
        self.gl.linkProgram(self.shader);
        self.gl.useProgram(self.shader);
        
        // START BUFFERS
        self.shader.vertexPositionAttribute = self.gl.getAttribLocation(self.shader, 'aVertexPosition');
        self.gl.enableVertexAttribArray(self.shader.vertexPositionAttribute);
        
        self.shader.vertexColorAttribute = self.gl.getAttribLocation(self.shader, 'aVertexColor');
        self.gl.enableVertexAttribArray(self.shader.vertexColorAttribute);
        
        self.shader.vertexNormalAttribute = self.gl.getAttribLocation(self.shader, 'aVertexNormal');
        self.gl.enableVertexAttribArray(self.shader.vertexNormalAttribute);
        // END BUFFERS
        
        self.shader.opacity = self.gl.getUniformLocation(self.shader, 'uOpacity');
        self.shader.waterColor = self.gl.getUniformLocation(self.shader, 'uWaterColor');
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
    this.gl.useProgram(this.shader);
}; 

DefaultShader.prototype.setWaterColor = function(color) {
    this.gl.useProgram(this.shader);
    this.gl.uniform3f(this.shader.waterColor, color[0], color[1], color[2]);
};