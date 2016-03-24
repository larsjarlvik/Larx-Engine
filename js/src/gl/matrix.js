'use strict';

class LarxMatrix {
	constructor() {
		this.mvMatrix = mat4.create();
		this.pMatrix = mat4.create();
		this.mvStack = [];
		this.aspect = 0;
		this.nearPlane = 5.0;
		this.farPlane = 500.0;
		this.fieldOfView = 45;
	}
	
	push() {
		this._copy = mat4.create();
		mat4.copy(this._copy, this.mvMatrix);
		this.mvStack.push(this._copy);
	}

	pop() {
		this.mvMatrix = this.mvStack.pop();
	}

	setIdentity(matrix) {
		mat4.identity(this.mvMatrix);   
		
		if(matrix) {
			mat4.rotateX(this.mvMatrix, this.mvMatrix, matrix.rotV);
			mat4.rotateY(this.mvMatrix, this.mvMatrix, matrix.rotH);
			mat4.translate(this.mvMatrix, this.mvMatrix, [matrix.x, matrix.y, matrix.z]);
		}
	}
	
	setPerspectiveProjection() {
		mat4.perspective(this.pMatrix, this.fieldOfView, this.aspect, this.nearPlane, this.farPlane);
	}
	
	setOrthoProjection(l, r, b, t) {
		mat4.ortho(this.pMatrix, l, r, b, t, this.nearPlane, this.farPlane);
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

