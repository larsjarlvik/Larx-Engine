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
        mat4.copy(copy, _mvMatrix);
        _mvStack.push(copy);
    };
    
    Matrix.prototype.pop = function () {
        _mvMatrix = _mvStack.pop();
    };
    
    Matrix.prototype.setIdentity = function () {
        mat4.perspective(_pMatrix, 45, _gl.viewportWidth / _gl.viewportHeight, 0.1, 1000.0);
        mat4.identity(_mvMatrix);   
        
        var mat = _camera.getMatrix();
        
        mat4.rotate(_mvMatrix, _mvMatrix, mat.rotV, [1, 0, 0]);
        mat4.rotate(_mvMatrix, _mvMatrix, mat.rotH, [0, 1, 0]);
        mat4.translate(_mvMatrix, _mvMatrix, [mat.x, mat.y, mat.z]);
    };
    
    Matrix.prototype.setUniforms = function (shaderProgram) {
        var sp = shaderProgram.get();
        
        _gl.uniformMatrix4fv(sp.pMatrixUniform, false, _pMatrix);
        _gl.uniformMatrix4fv(sp.mvMatrixUniform, false, _mvMatrix);
        
        var normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, _mvMatrix);
        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);
        
        _gl.uniformMatrix3fv(sp.nMatrixUniform, false, normalMatrix);
    };
    
    Matrix.prototype.translate = function (vec) {
        mat4.translate(_mvMatrix, _mvMatrix, vec);
    };
    
    Matrix.prototype.camera = {
        get: function () {
            return _camera;
        },
        translate: function (x, z) {
            _camera.look.x = x;
            _camera.look.z = z;
        }  
    };
    
    return Matrix;
})();