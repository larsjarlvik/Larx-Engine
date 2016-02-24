var WaterShader = function (gl) {
    this.gl = gl;
    this.shaders = undefined;
    this.shader = undefined;
};

WaterShader.prototype.load = function(engine) {
    var deferred = Q.defer();
    var self = this;
    
    this.gl = engine.gl;
    this.shaders = new Shaders(this.gl);
    
    this.shaders.downloadShaderProgram('water').then(function (shaderProgram) {    
        self.shader = shaderProgram;
        
        self.gl.linkProgram(self.shader);
        self.gl.useProgram(self.shader);
        
        self.buffers = {};
        
        self.shader.vertexPositionAttribute = self.gl.getAttribLocation(self.shader, 'aVertexPosition');
        self.gl.enableVertexAttribArray(self.shader.vertexPositionAttribute);
        
        self.shader.vertexNormalAttribute = self.gl.getAttribLocation(self.shader, 'aVertexNormal');
        self.gl.enableVertexAttribArray(self.shader.vertexNormalAttribute);

        self.shader.pMatrixUniform = self.gl.getUniformLocation(self.shader, 'uPMatrix');
        self.shader.mvMatrixUniform = self.gl.getUniformLocation(self.shader, 'uMVMatrix');
        self.shader.nMatrixUniform  = self.gl.getUniformLocation(self.shader, 'uNMatrix');
        
        self.shader.color = self.gl.getUniformLocation(self.shader, 'uColor');
        self.shader.opacity = self.gl.getUniformLocation(self.shader, 'uOpacity');
        
        self.shaders.setLighting(self.shader);
        
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
    this.gl.useProgram(this.shader);
}; 

WaterShader.prototype.setColor = function(color) {
    this.gl.useProgram(this.shader);
    this.gl.uniform3f(this.shader.color, color[0], color[1], color[2]);
};

