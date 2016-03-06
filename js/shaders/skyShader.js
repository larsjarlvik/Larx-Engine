Larx.SkyShader = function () {
    this.shader;
};

Larx.SkyShader.prototype = {
    load: function() {
        var deferred = Q.defer();
        var self = this;
        
        Larx.Shaders.downloadShaderProgram('sky').then(function (shaderProgram) {    
            self.shader = shaderProgram;
            
            Larx.gl.linkProgram(self.shader);
            Larx.gl.useProgram(self.shader);
            
            // START BUFFERS
            self.shader.textureCoordAttribute = Larx.gl.getAttribLocation(self.shader, 'aTextureCoord');
            // END BUFFERS
            
            self.shader.stop1 = Larx.gl.getUniformLocation(self.shader, 'uStop1');
            self.shader.stop2 = Larx.gl.getUniformLocation(self.shader, 'uStop2');
            self.shader.stop3 = Larx.gl.getUniformLocation(self.shader, 'uStop3');
            
            self.shaders.setDefaults(self.shader, false);
            
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
        Larx.Larx.gl.useProgram(this.shader);
        Larx.Larx.gl.enableVertexAttribArray(this.shader.textureCoordAttribute);
    },

    cleanUp: function() {
        Larx.Larx.gl.disableVertexAttribArray(this.shader.textureCoordAttribute);
    },

    setColorStop1: function(color) {
        Larx.Larx.gl.uniform3f(this.shader.stop1, color[0], color[1], color[2]);
    },

    setColorStop2: function(color) {
        Larx.Larx.gl.uniform3f(this.shader.stop2, color[0], color[1], color[2]);
    },

    setColorStop3: function(color) {
        Larx.Larx.gl.uniform3f(this.shader.stop3, color[0], color[1], color[2]);
    }
};