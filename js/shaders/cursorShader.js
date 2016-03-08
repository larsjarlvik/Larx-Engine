/* global Larx */

Larx.CursorShader = function() {
    this.shader;
};

Larx.CursorShader.prototype = {
    load: function() {
        var deferred = Q.defer();
        var self = this;
        
        Larx.Shaders.downloadShaderProgram('cursor').then(function (shaderProgram) {    
            self.shader = shaderProgram;
            
            Larx.gl.linkProgram(self.shader);
            Larx.gl.useProgram(self.shader);
            
            self.shader.textureCoordAttribute = Larx.gl.getAttribLocation(self.shader, 'aTextureCoord');
            self.shader.radius = Larx.gl.getUniformLocation(self.shader, 'uRadius');
            self.shader.color = Larx.gl.getUniformLocation(self.shader, 'uColor');
            
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
        Larx.gl.enableVertexAttribArray(this.shader.textureCoordAttribute);
    },

    cleanUp: function() {
        Larx.gl.disableVertexAttribArray(this.shader.textureCoordAttribute);
    },

    setColor: function(color) {
        Larx.gl.uniform3f(this.shader.color, color[0], color[1], color[2]);
    },

    setRadius: function(radius) {
        Larx.gl.uniform1f(this.shader.radius, radius);
    }
};