/* global mat3 */
/* global mat4 */

var Matrix = function(ctx) {
    this.ctx = ctx;
    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.mvStack = [];
};

    
Matrix.prototype.push = function () {
    this._copy = mat4.create();
    mat4.copy(this._copy, this.mvMatrix);
    this.mvStack.push(this._copy);
};

Matrix.prototype.pop = function () {
    this.mvMatrix = this.mvStack.pop();
};

Matrix.prototype.setIdentity = function () {
    mat4.perspective(this.pMatrix, 45, this.ctx.gl.viewportWidth / this.ctx.gl.viewportHeight, 0.1, 1000.0);
    mat4.identity(this.mvMatrix);   
    
    this._cMat = this.ctx.camera.getMatrix();
    
    mat4.rotate(this.mvMatrix, this.mvMatrix, this._cMat.rotV, [1, 0, 0]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, this._cMat.rotH, [0, 1, 0]);
    mat4.translate(this.mvMatrix, this.mvMatrix, [this._cMat.x, this._cMat.y, this._cMat.z]);
};

Matrix.prototype.setUniforms = function (shaderProgram) {
    this._sp = shaderProgram.get();
    
    this.ctx.gl.uniformMatrix4fv(this._sp.pMatrixUniform, false, this.pMatrix);
    this.ctx.gl.uniformMatrix4fv(this._sp.mvMatrixUniform, false, this.mvMatrix);
    
    this._nMatrix = mat3.create();
    mat3.fromMat4(this._nMatrix, this.mvMatrix);
    mat3.invert(this._nMatrix, this._nMatrix);
    mat3.transpose(this._nMatrix, this._nMatrix);
    
    this.ctx.gl.uniformMatrix3fv(this._sp.nMatrixUniform, false, this._nMatrix);
};

Matrix.prototype.translate = function (vec) {
    mat4.translate(this.mvMatrix, this.mvMatrix, vec);
};

Matrix.prototype.rotate = function (vec) {
    mat4.rotate(this.mvMatrix, this.mvMatrix, vec);
};