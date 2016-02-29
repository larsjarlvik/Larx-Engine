var CursorShader = function(ctx) {
    this.ctx = ctx;
    this.shaders = undefined;
    this.shader = undefined;
};

CursorShader.prototype.load = function() {
    var deferred = Q.defer();
    var self = this;
    var gl = this.ctx.gl;
    
    this.shaders = new Shaders(this.ctx);
    this.shaders.downloadShaderProgram('cursor').then(function (shaderProgram) {    
        self.shader = shaderProgram;
        
        gl.linkProgram(self.shader);
        gl.useProgram(self.shader);
        
        // START BUFFERS
        self.shader.vertexPositionAttribute = gl.getAttribLocation(self.shader, 'aVertexPosition');
        gl.enableVertexAttribArray(self.shader.vertexPositionAttribute);
        
        self.shader.textureCoordAttribute = gl.getAttribLocation(self.shader, 'aTextureCoord');
        gl.enableVertexAttribArray(self.shader.vertexPositionAttribute);
        // END BUFFERS
        
        self.shader.radius = gl.getUniformLocation(self.shader, 'uRadius');
        self.shader.color = gl.getUniformLocation(self.shader, 'uColor');
        
        self.shaders.setDefaults(self.shader, false);
        
        deferred.resolve();
    }).catch(function (e) {
        console.error(e);
    });
    
    return deferred.promise;
};

CursorShader.prototype.get = function() {
    return this.shader;
}; 

CursorShader.prototype.use = function() {
    this.ctx.gl.useProgram(this.shader);
}; 

CursorShader.prototype.setColor = function(color) {
    this.ctx.gl.uniform3f(this.shader.color, color[0], color[1], color[2]);
};

CursorShader.prototype.setRadius = function(radius) {
    this.ctx.gl.uniform1f(this.shader.radius, radius);
};