/* global Larx */

Larx.WaterShader = function () {
    this.shader = undefined;
};

Larx.WaterShader.prototype = {
    load: function() {
        var deferred = Q.defer();
        var self = this;
        
        Larx.Shaders.downloadShaderProgram('water').then(function (shaderProgram) {    
            self.shader = shaderProgram;
            
            Larx.gl.linkProgram(self.shader);
            Larx.gl.useProgram(self.shader);
            
            self.buffers = {};
            
            self.shader.vertexNormalAttribute = Larx.gl.getAttribLocation(self.shader, 'aVertexNormal');
            
            self.shader.color = Larx.gl.getUniformLocation(self.shader, 'uColor');
            self.shader.time = Larx.gl.getUniformLocation(self.shader, 'uTime');
            
            self.shader.refractionDepthTexture = Larx.gl.getUniformLocation(self.shader, 'uRefractionDepthTexture');
            self.shader.refractionColorTexture = Larx.gl.getUniformLocation(self.shader, 'uRefractionColorTexture');
            self.shader.reflectionColorTexture = Larx.gl.getUniformLocation(self.shader, 'uReflectionColorTexture');
            
            self.shader.fogDensity = Larx.gl.getUniformLocation(self.shader, 'uFogDensity');
            self.shader.fogGradient = Larx.gl.getUniformLocation(self.shader, 'uFogGradient');
            self.shader.fogColor = Larx.gl.getUniformLocation(self.shader, 'uFogColor');
            
            self.shader.distortion = Larx.gl.getUniformLocation(self.shader, 'uDistortion');
            self.shader.edgeWhitening = Larx.gl.getUniformLocation(self.shader, 'uEdgeWhitening');
            self.shader.edgeSoftening = Larx.gl.getUniformLocation(self.shader, 'uEdgeSoftening');
            self.shader.waterDensity = Larx.gl.getUniformLocation(self.shader, 'uWaterDensity');
            
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
        Larx.gl.enableVertexAttribArray(this.shader.vertexNormalAttribute);
    }, 

    cleanUp: function() {
        Larx.gl.disableVertexAttribArray(this.shader.vertexNormalAttribute);
    },

    setWaterColor: function(color) {
        Larx.gl.uniform3f(this.shader.color, color[0], color[1], color[2]);
    },

    update: function(time) {
        Larx.gl.uniform1f(this.shader.time, time);
    },

    setRefractionDepthTexture: function(index) {
        Larx.gl.uniform1i(this.shader.refractionDepthTexture, 0);  
    },

    setRefractionColorTexture: function(index) {
        Larx.gl.uniform1i(this.shader.refractionColorTexture, 1);  
    },

    setReflectionColorTexture: function(index) {
        Larx.gl.uniform1i(this.shader.reflectionColorTexture, 2);  
    },

    setDistortion: function(value) {
        Larx.gl.uniform1f(this.shader.distortion, value);  
    },

    setEdgeWhitening: function(value) {
        Larx.gl.uniform1f(this.shader.edgeWhitening, value);  
    },
    
    setEdgeSoftening: function(value) {
        Larx.gl.uniform1f(this.shader.edgeSoftening, value);  
    },
    
    setDensity: function(value) {
        Larx.gl.uniform1f(this.shader.waterDensity, value);  
    },

    setFog: function(density, gradient, color) {
        Larx.gl.uniform1f(this.shader.fogDensity, density);
        Larx.gl.uniform1f(this.shader.fogGradient, gradient);
        Larx.gl.uniform3f(this.shader.fogColor, color[0], color[1], color[2]);
    }
};