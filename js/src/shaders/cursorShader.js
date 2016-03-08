"use strict";

class LarxCursorShader extends LarxShader {
    constructor() {
        super();
    }
    
    load() {
        var deferred = Q.defer();
        
        this.downloadShaderProgram('cursor').then((shaderProgram) => {    
            this.shader = shaderProgram;
            
            Larx.gl.linkProgram(this.shader);
            Larx.gl.useProgram(this.shader);
            
            this.shader.textureCoordAttribute = Larx.gl.getAttribLocation(this.shader, 'aTextureCoord');
            this.shader.radius = Larx.gl.getUniformLocation(this.shader, 'uRadius');
            this.shader.color = Larx.gl.getUniformLocation(this.shader, 'uColor');
            
            this.setDefaults(this.shader, false);
            
            deferred.resolve();
        }).catch(function (e) {
            console.error(e);
        });
        
        return deferred.promise;
    }

    use() {
        Larx.gl.useProgram(this.shader);
        Larx.gl.enableVertexAttribArray(this.shader.textureCoordAttribute);
    }

    cleanUp() {
        Larx.gl.disableVertexAttribArray(this.shader.textureCoordAttribute);
    }

    setColor(color) {
        Larx.gl.uniform3f(this.shader.color, color[0], color[1], color[2]);
    }

    setRadius(radius) {
        Larx.gl.uniform1f(this.shader.radius, radius);
    }
}