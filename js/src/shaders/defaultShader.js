'use strict';

class LarxDefaultShader extends LarxShader {
    constructor() {
        super();
        this.clip = { ABOVE: 1, BELOW: 2 }
    }
    
    load() {
        return new Promise((resolve, reject) => {
            this.downloadShaderProgram('default').then((shaderProgram) => {    
                this.shader = shaderProgram;
                
                Larx.gl.linkProgram(this.shader);
                Larx.gl.useProgram(this.shader);
                
                this.shader.vertexColorAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexColor');
                this.shader.vertexNormalAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexNormal');

                this.shader.fogDensity = Larx.gl.getUniformLocation(this.shader, 'uFogDensity');
                this.shader.fogGradient = Larx.gl.getUniformLocation(this.shader, 'uFogGradient');
                this.shader.fogColor = Larx.gl.getUniformLocation(this.shader, 'uFogColor');
                this.shader.enableFog = Larx.gl.getUniformLocation(this.shader, 'uEnableFog');
                
                this.shader.clipPlane = Larx.gl.getUniformLocation(this.shader, 'uClipPlane');
                this.shader.clipPlaneLevel = Larx.gl.getUniformLocation(this.shader, 'uClipPlaneLevel');
                
                this.shader.shadowMvpMatrixUniform = Larx.gl.getUniformLocation(this.shader, 'shadowMvpMatrix');
                this.shader.shadowMapTexture = Larx.gl.getUniformLocation(this.shader, 'uShadowMapTexture');
                this.shader.shadowDistance = Larx.gl.getUniformLocation(this.shader, 'uShadowDistance');
                this.shader.shadowTransition = Larx.gl.getUniformLocation(this.shader, 'uShadowTransition');
                this.shader.shadowMapResolution = Larx.gl.getUniformLocation(this.shader, 'uShadowMapResolution');
                this.shader.enableShadows = Larx.gl.getUniformLocation(this.shader, 'uEnableShadows');
                
                this.setDefaults(this.shader, true);
                
                resolve();
            }).catch(function (e) {
                console.error(e);
                reject(e);
            });
        });
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
    
    enableFog(enable) {
        Larx.gl.uniform1i(this.shader.enableFog, enable == true ? 1 : 0);
    }
    
    enableShadows(enable) {
        Larx.gl.uniform1i(this.shader.enableShadows, enable == true ? 1 : 0);
    }
    
    setShadowMapTexture(textureUnit) {
        Larx.gl.uniform1i(this.shader.shadowMapTexture, textureUnit);
    }
    
    setShadowMapSpaceMatrix(matrix) {
        Larx.gl.uniformMatrix4fv(this.shader.shadowMvpMatrixUniform, false, matrix);
    }
    
    setShadowDistanceTransition(distance, transition) {
        Larx.gl.uniform1f(this.shader.shadowDistance, distance);
        Larx.gl.uniform1f(this.shader.shadowTransition, transition);
    }
    
    setShadowMapResolution(size) {
        Larx.gl.uniform1f(this.shader.shadowMapResolution, size);
    }
}