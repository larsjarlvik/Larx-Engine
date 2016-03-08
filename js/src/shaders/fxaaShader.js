"use strict";

class LarxFxaaShader extends LarxShader {
    constructor() {
        super();
    }
    
    load() {
        var deferred = Q.defer();
        
        this.downloadShaderProgram('fxaa').then((shaderProgram) => {    
            this.shader = shaderProgram;
            
            Larx.gl.linkProgram(this.shader);
            Larx.gl.useProgram(this.shader);
            
            this.shader.vertexPositionAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexPosition');
            this.shader.resolution = Larx.gl.getUniformLocation(this.shader, 'uResolution');
            this.shader.texture = Larx.gl.getUniformLocation(this.shader, 'uTexture');
            
            this.setDefaults(this.shader, false);
            
            deferred.resolve();
        }).catch(function (e) {
            console.error(e);
        });
        
        return deferred.promise;
    }
    
    use() {
        Larx.gl.useProgram(this.shader);
    }
    
    setResolution(w, h) {
        Larx.gl.uniform2f(this.shader.resolution, w, h);
    }

    setTexture(index) {
        Larx.gl.uniform1i(this.shader.texture, index);  
    }
}

