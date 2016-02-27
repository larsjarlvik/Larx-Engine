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
        
        self.shader.vertexPositionAttribute = gl.getAttribLocation(self.shader, 'aVertexPosition');
        gl.enableVertexAttribArray(self.shader.vertexPositionAttribute);
        
        self.shader.vertexNormalAttribute = gl.getAttribLocation(self.shader, 'aVertexNormal');
        gl.enableVertexAttribArray(self.shader.vertexNormalAttribute);
        
        self.shader.vertexWaterDepthAttribute = gl.getAttribLocation(self.shader, 'aWaterDepth');
        gl.enableVertexAttribArray(self.shader.vertexWaterDepthAttribute);
        
        self.shader.color = gl.getUniformLocation(self.shader, 'uColor');
        self.shader.opacity = gl.getUniformLocation(self.shader, 'uOpacity');
        
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
}; 

WaterShader.prototype.setWaterColor = function(color) {
    this.ctx.gl.useProgram(this.shader);
    this.ctx.gl.uniform3f(this.shader.color, color[0], color[1], color[2]);
};