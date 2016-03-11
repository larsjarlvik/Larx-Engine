"use strict";

class LarxMatrix {
    constructor() {
        this.mvMatrix = mat4.create();
        this.pMatrix = mat4.create();
        this.mvStack = [];
        this.aspect = 0;
        this.farPlane = 500.0;
    }
    
    push() {
        this._copy = mat4.create();
        mat4.copy(this._copy, this.mvMatrix);
        this.mvStack.push(this._copy);
    }

    pop() {
        this.mvMatrix = this.mvStack.pop();
    }

    setIdentity(invert) {
        mat4.perspective(this.pMatrix, 45, this.aspect, 5.0, this.farPlane);
        mat4.identity(this.mvMatrix);   
        
        if(invert) {
            this.cMat = Larx.Camera.getInvertedMatrix();
        } else {
            this.cMat = Larx.Camera.getMatrix();
        }
        
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.cMat.rotV, [1, 0, 0]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.cMat.rotH, [0, 1, 0]);
        mat4.translate(this.mvMatrix, this.mvMatrix, [this.cMat.x, this.cMat.y, this.cMat.z]);
    }

    setUniforms(shaderProgram) {
        this.sp = shaderProgram.get();
        
        Larx.gl.uniformMatrix4fv(this.sp.pMatrixUniform, false, this.pMatrix);
        Larx.gl.uniformMatrix4fv(this.sp.mvMatrixUniform, false, this.mvMatrix);
        
        this.nMatrix = mat3.create();
        mat3.fromMat4(this.nMatrix, this.mvMatrix);
        mat3.invert(this.nMatrix, this.nMatrix);
        mat3.transpose(this.nMatrix, this.nMatrix);
        
        Larx.gl.uniformMatrix3fv(this.sp.nMatrixUniform, false, this.nMatrix);
    }

    translate(vec) {
        mat4.translate(this.mvMatrix, this.mvMatrix, vec);
    }

    rotate(angle, vec) {
        mat4.rotate(this.mvMatrix, this.mvMatrix, angle, vec);
    }
};

