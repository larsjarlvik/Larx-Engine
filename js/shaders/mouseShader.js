/* Larx.global Q */

Larx.MouseShader = function() {
    this.shader;
};

Larx.MouseShader.prototype = {
    load: function() {
        var deferred = Q.defer();
        var self = this;
        
        Larx.Shaders.downloadShaderProgram('mouse').then(function (shaderProgram) {    
            self.shader = shaderProgram;
            
            Larx.gl.linkProgram(self.shader);
            Larx.gl.useProgram(self.shader);
            
            self.shader.vertexPositionAttribute = Larx.gl.getAttribLocation(self.shader, 'aVertexPosition');
            
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
    }
};

