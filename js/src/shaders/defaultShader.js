"use strict";

class LarxDefaultShader extends LarxShader {
    constructor() {
        super();
        this.clip = { ABOVE: 1, BELOW: 2 }
    }
    
    load() {
        var deferred = Q.defer();
        
        this.downloadShaderProgram('default').then((shaderProgram) => {    
            this.shader = shaderProgram;
            
            Larx.gl.linkProgram(this.shader);
            Larx.gl.useProgram(this.shader);
            
            this.shader.vertexColorAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexColor');
            this.shader.vertexNormalAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexNormal');

            this.shader.fogDensity = Larx.gl.getUniformLocation(this.shader, 'uFogDensity');
            this.shader.fogGradient = Larx.gl.getUniformLocation(this.shader, 'uFogGradient');
            this.shader.fogColor = Larx.gl.getUniformLocation(this.shader, 'uFogColor');
            this.shader.useFog = Larx.gl.getUniformLocation(this.shader, 'uUseFog');
            
            this.shader.clipPlane = Larx.gl.getUniformLocation(this.shader, 'uClipPlane');
            this.shader.clipPlaneLevel = Larx.gl.getUniformLocation(this.shader, 'uClipPlaneLevel');
            
            this.setDefaults(this.shader, true);
            
            deferred.resolve();
        }).catch(function (e) {
            console.error(e);
        });
        
        return deferred.promise;
    }

    use() {
        Larx.gl.useProgram(this.shader);
        Larx.gl.enableVertexAttribArray(this.shader.vertexColorAttribute);
        Larx.gl.enableVertexAttribArray(this.shader.vertexNormalAttribute);
    }

    setClipPlane(clipPlane, clipPlaneLevel) {
        Larx.gl.uniform1i(this.shader.clipPlane, clipPlane);
        Larx.gl.uniform1f(this.shader.clipPlaneLevel, clipPlaneLevel);
    }

    cleanUp() {
        Larx.gl.disableVertexAttribArray(this.shader.vertexColorAttribute);
        Larx.gl.disableVertexAttribArray(this.shader.vertexNormalAttribute);
        this.setClipPlane(0, 0); 
    }

    setFog(density, gradient, color) {
        Larx.gl.uniform1f(this.shader.fogDensity, density);
        Larx.gl.uniform1f(this.shader.fogGradient, gradient);
        Larx.gl.uniform3f(this.shader.fogColor, color[0], color[1], color[2]);
    }
    
    useFog(enable) {
        Larx.gl.uniform1i(this.shader.useFog, enable == true ? 1 : 0);
    }
}