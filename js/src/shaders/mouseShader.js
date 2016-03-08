"use strict";

class LarxMouseShader extends LarxShader {
    constructor() {
        super();
    }
    
    load() {
        var deferred = Q.defer();
        
        this.downloadShaderProgram('mouse').then((shaderProgram) => {    
            this.shader = shaderProgram;
            
            Larx.gl.linkProgram(this.shader);
            Larx.gl.useProgram(this.shader);
            
            this.shader.vertexPositionAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexPosition');
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
}

