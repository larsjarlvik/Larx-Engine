'use strict';

class LarxShadowShader extends LarxShader {
    constructor() {
        super();
    }
    
    load() {
        return new Promise((resolve, reject) => {
            this.downloadShaderProgram('shadow').then((shaderProgram) => {    
                this.shader = shaderProgram;
                
                Larx.gl.linkProgram(this.shader);
                Larx.gl.useProgram(this.shader);
                
                this.shader.vertexPositionAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexPosition');
                this.shader.mvpMatrixUniform = Larx.gl.getUniformLocation(this.shader, 'uMVPMatrix');
                
                resolve();
            }).catch(function (e) {
                console.error(e);
                reject(e);
            });
        });
    }

    use() {
        Larx.gl.useProgram(this.shader);
    }
    
    cleanUp() {
    }
    
    setMatrix(matrix) {
        Larx.gl.uniformMatrix4fv(this.shader.mvpMatrixUniform, false, matrix);
    }
}

