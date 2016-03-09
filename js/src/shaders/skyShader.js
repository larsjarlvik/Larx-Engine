"use strict";

class LarxSkyShader extends LarxShader {
    constructor() {
        super();
    }
    
    load() {
        return new Promise((resolve, reject) => {
            Larx.Shaders.downloadShaderProgram('sky').then((shaderProgram) => {    
                this.shader = shaderProgram;
                
                Larx.gl.linkProgram(this.shader);
                Larx.gl.useProgram(this.shader);
                
                // START BUFFERS
                this.shader.textureCoordAttribute = Larx.gl.getAttribLocation(this.shader, 'aTextureCoord');
                // END BUFFERS
                
                this.shader.stop1 = Larx.gl.getUniformLocation(this.shader, 'uStop1');
                this.shader.stop2 = Larx.gl.getUniformLocation(this.shader, 'uStop2');
                this.shader.stop3 = Larx.gl.getUniformLocation(this.shader, 'uStop3');
                this.shaders.setDefaults(this.shader, false);
                
                resolve();
            }).catch(function (e) {
                console.error(e);
                reject(e);
            });
        });
    }

    use() {
        Larx.Larx.gl.useProgram(this.shader);
        Larx.Larx.gl.enableVertexAttribArray(this.shader.textureCoordAttribute);
    }

    cleanUp() {
        Larx.Larx.gl.disableVertexAttribArray(this.shader.textureCoordAttribute);
    }

    setColorStop1(color) {
        Larx.Larx.gl.uniform3f(this.shader.stop1, color[0], color[1], color[2]);
    }

    setColorStop2(color) {
        Larx.Larx.gl.uniform3f(this.shader.stop2, color[0], color[1], color[2]);
    }

    setColorStop3(color) {
        Larx.Larx.gl.uniform3f(this.shader.stop3, color[0], color[1], color[2]);
    }
}