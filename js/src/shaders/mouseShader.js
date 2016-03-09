"use strict";

class LarxMouseShader extends LarxShader {
    constructor() {
        super();
    }
    
    load() {
        return new Promise((resolve, reject) => {
            this.downloadShaderProgram('mouse').then((shaderProgram) => {    
                this.shader = shaderProgram;
                
                Larx.gl.linkProgram(this.shader);
                Larx.gl.useProgram(this.shader);
                
                this.shader.vertexPositionAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexPosition');
                this.setDefaults(this.shader, false);
                
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
}

