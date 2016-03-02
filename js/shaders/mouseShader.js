/* global Q */

var MouseShader = function(ctx) {
    this.ctx = ctx;
    this.shaders = undefined;
    this.shader = undefined;
};


MouseShader.prototype.load = function() {
    var deferred = Q.defer();
    var self = this;
    var gl = this.ctx.gl;
    
    this.shaders = new Shaders(this.ctx);
    this.shaders.downloadShaderProgram('mouse').then(function (shaderProgram) {    
        self.shader = shaderProgram;
        
        gl.linkProgram(self.shader);
        gl.useProgram(self.shader);
        
        // START BUFFERS
        self.shader.vertexPositionAttribute = gl.getAttribLocation(self.shader, 'aVertexPosition');
        gl.enableVertexAttribArray(self.shader.vertexPositionAttribute);
        // END BUFFERS
        
        self.shader.colorId = gl.getUniformLocation(self.shader, 'uColorId');
        self.shaders.setDefaults(self.shader, false);
        
        deferred.resolve();
    }).catch(function (e) {
        console.error(e);
    });
    
    return deferred.promise;
};

MouseShader.prototype.get = function() {
    return this.shader;
}; 

MouseShader.prototype.use = function() {
    this.ctx.gl.useProgram(this.shader);
}; 

MouseShader.prototype.setColorId = function(id) {
    this.ctx.gl.uniform1f(this.shader.colorId, id);
};