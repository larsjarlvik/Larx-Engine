/* global Larx */

Larx.FxaaShader = function() {
    this.shader;
};

Larx.FxaaShader.prototype = {
    load: function() {
        var deferred = Q.defer();
        var self = this;
        
        Larx.Shaders.downloadShaderProgram('fxaa').then(function (shaderProgram) {    
            self.shader = shaderProgram;
            
            Larx.gl.linkProgram(self.shader);
            Larx.gl.useProgram(self.shader);
            
            self.shader.vertexPositionAttribute = Larx.gl.getAttribLocation(self.shader, 'aVertexPosition');
            self.shader.resolution = Larx.gl.getUniformLocation(self.shader, 'uResolution');
            self.shader.texture = Larx.gl.getUniformLocation(self.shader, 'uTexture');
            
            Larx.Shaders.setDefaults(self.shader, false);
            
            deferred.resolve();
        }).catch(function (e) {
            console.error(e);
        });
        
        return deferred.promise;
    },

    get: function() {
        return this.shader;
    },

    use: function() {
        Larx.gl.useProgram(this.shader);
    },
    
    setResolution: function (w, h) {
        Larx.gl.uniform2f(this.shader.resolution, w, h);
    },

    setTexture: function(index) {
        Larx.gl.uniform1i(this.shader.texture, index);  
    }
};

