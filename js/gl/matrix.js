/* global mat3 */
/* global mat4 */

var Matrix = (function () {
    
    var _gl, _camera, _mvMatrix, _pMatrix;
    var _mvStack = [];
    
    function Matrix(gl, camera) {
        _mvMatrix = mat4.create();
        _pMatrix = mat4.create();
        _gl = gl;
        _camera = camera;
    }
    
    Matrix.prototype.push = function () {
        var copy = mat4.create();
        mat4.set(_mvMatrix, copy);
        _mvStack.push(copy);
    };
    
    Matrix.prototype.pop = function () {
        _mvMatrix = _mvStack.pop();
    };
    
    Matrix.prototype.setIdentity = function () {
        mat4.perspective(45, _gl.viewportWidth / _gl.viewportHeight, 0.1, 1000.0, _pMatrix);
        
        mat4.identity(_mvMatrix);
        
        var mat = _camera.getMatrix();
        
        mat4.rotate(_mvMatrix, mat.rotV, [1, 0, 0]);
        mat4.rotate(_mvMatrix, mat.rotH, [0, 1, 0]);
        mat4.translate(_mvMatrix, [mat.x, mat.y, mat.z]);
    };
    
    Matrix.prototype.setUniforms = function (shaderProgram) {
        _gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, _pMatrix);
        _gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, _mvMatrix);
        
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(_mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        _gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    };
    
    Matrix.prototype.translate = function (vec) {
        mat4.translate(_mvMatrix, vec);
    };
    
    Matrix.prototype.camera = {
        get: function () {
            return _camera;
        },
        translate: function (x, z) {
            _camera.look.x = x;
            _camera.look.z = z;
            
            console.log(_camera.look.z);
        }  
    };
    
    return Matrix;
})();