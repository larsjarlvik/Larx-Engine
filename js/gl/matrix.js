/* global mat3 */
/* global mat4 */

var Matrix = function(ctx) {
    this.ctx = ctx;
    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.mvStack = [];
};

    
Matrix.prototype.push = function () {
    var copy = mat4.create();
    mat4.copy(copy, this.mvMatrix);
    this.mvStack.push(copy);
};

Matrix.prototype.pop = function () {
    this.mvMatrix = this.mvStack.pop();
};

Matrix.prototype.setIdentity = function () {
    mat4.perspective(this.pMatrix, 45, this.ctx.gl.viewportWidth / this.ctx.gl.viewportHeight, 0.1, 1000.0);
    mat4.identity(this.mvMatrix);   
    
    var mat = this.ctx.camera.getMatrix();
    
    mat4.rotate(this.mvMatrix, this.mvMatrix, mat.rotV, [1, 0, 0]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, mat.rotH, [0, 1, 0]);
    mat4.translate(this.mvMatrix, this.mvMatrix, [mat.x, mat.y, mat.z]);
};

Matrix.prototype.setUniforms = function (shaderProgram) {
    var sp = shaderProgram.get();
    
    this.ctx.gl.uniformMatrix4fv(sp.pMatrixUniform, false, this.pMatrix);
    this.ctx.gl.uniformMatrix4fv(sp.mvMatrixUniform, false, this.mvMatrix);
    
    var normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix, this.mvMatrix);
    mat3.invert(normalMatrix, normalMatrix);
    mat3.transpose(normalMatrix, normalMatrix);
    
    this.ctx.gl.uniformMatrix3fv(sp.nMatrixUniform, false, normalMatrix);
};

Matrix.prototype.translate = function (vec) {
    mat4.translate(this.mvMatrix, this.mvMatrix, vec);
};