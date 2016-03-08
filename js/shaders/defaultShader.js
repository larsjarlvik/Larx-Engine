/* global Larx */

Larx.DefaultShader = function () {
    this.shader;
    
    this.clip = {
        ABOVE: 1,
        BELOW: 2
    }
};

Larx.DefaultShader.prototype = {
    load: function() {
        var deferred = Q.defer();
        var self = this;
        
        Larx.Shaders.downloadShaderProgram('default').then(function (shaderProgram) {    
            self.shader = shaderProgram;
            
            Larx.gl.linkProgram(self.shader);
            Larx.gl.useProgram(self.shader);
            
            self.shader.vertexColorAttribute = Larx.gl.getAttribLocation(self.shader, 'aVertexColor');
            self.shader.vertexNormalAttribute = Larx.gl.getAttribLocation(self.shader, 'aVertexNormal');

            self.shader.fogDensity = Larx.gl.getUniformLocation(self.shader, 'uFogDensity');
            self.shader.fogGradient = Larx.gl.getUniformLocation(self.shader, 'uFogGradient');
            self.shader.fogColor = Larx.gl.getUniformLocation(self.shader, 'uFogColor');
            self.shader.useFog = Larx.gl.getUniformLocation(self.shader, 'uUseFog');
            
            self.shader.clipPlane = Larx.gl.getUniformLocation(self.shader, 'uClipPlane');
            self.shader.clipPlaneLevel = Larx.gl.getUniformLocation(self.shader, 'uClipPlaneLevel');
            
            Larx.Shaders.setDefaults(self.shader, true);
            
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
        Larx.gl.enableVertexAttribArray(this.shader.vertexColorAttribute);
        Larx.gl.enableVertexAttribArray(this.shader.vertexNormalAttribute);
    },

    setClipPlane: function(clipPlane, clipPlaneLevel) {
        Larx.gl.uniform1i(this.shader.clipPlane, clipPlane);
        Larx.gl.uniform1f(this.shader.clipPlaneLevel, clipPlaneLevel);
    },

    cleanUp: function() {
        Larx.gl.disableVertexAttribArray(this.shader.vertexColorAttribute);
        Larx.gl.disableVertexAttribArray(this.shader.vertexNormalAttribute);
        this.setClipPlane(0, 0); 
    },

    setFog: function(density, gradient, color) {
        Larx.gl.uniform1f(this.shader.fogDensity, density);
        Larx.gl.uniform1f(this.shader.fogGradient, gradient);
        Larx.gl.uniform3f(this.shader.fogColor, color[0], color[1], color[2]);
    },
    
    useFog: function(enable) {
        Larx.gl.uniform1i(this.shader.useFog, enable == true ? 1 : 0);
    }
};