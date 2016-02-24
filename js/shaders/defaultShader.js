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
        
        self.buffers = {
            useColorBuffer: true,
            useNormalBuffer: true
        };
        
        // START BUFFERS
        self.shader.vertexPositionAttribute = self.gl.getAttribLocation(self.shader, 'aVertexPosition');
        self.gl.enableVertexAttribArray(self.shader.vertexPositionAttribute);
        
        self.shader.vertexColorAttribute = self.gl.getAttribLocation(self.shader, 'aVertexColor');
        self.gl.enableVertexAttribArray(self.shader.vertexColorAttribute);
        
        self.shader.vertexNormalAttribute = self.gl.getAttribLocation(self.shader, 'aVertexNormal');
        self.gl.enableVertexAttribArray(self.shader.vertexNormalAttribute);

        self.shader.pMatrixUniform = self.gl.getUniformLocation(self.shader, 'uPMatrix');
        self.shader.mvMatrixUniform = self.gl.getUniformLocation(self.shader, 'uMVMatrix');
        self.shader.nMatrixUniform  = self.gl.getUniformLocation(self.shader, 'uNMatrix');
        
        self.shader.opacity = self.gl.getUniformLocation(self.shader, 'uOpacity');
        // END BUFFERS
        
        self.shaders.setLighting(self.shader);
        
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
