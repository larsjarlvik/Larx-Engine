var Matrix = (function () {
    
    var _mvMatrix, _pMatrix;
    var _mvStack = [];
    
    var _camera = {
        zoom: 15,
        rot: { x: -20, y: 0 },
        pos: { x: 0, y: 4, z: -15 },
        lookAt: { x: 0, y: 0, z: 0 }
    }
    
    function Matrix() {
        _mvMatrix = mat4.create();
        _pMatrix = mat4.create();
    }
    
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    Matrix.prototype.push = function () {
        var copy = mat4.create();
        mat4.set(_mvMatrix, copy);
        _mvStack.push(copy);
    };
    
    Matrix.prototype.pop = function () {
        _mvMatrix = _mvStack.pop();
    };
    
    Matrix.prototype.setIdentity = function (gl) {
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, _pMatrix);
        
        mat4.identity(_mvMatrix);
        
        mat4.rotate(_mvMatrix, degToRad(-_camera.rot.x), [1, 0, 0]);
        mat4.rotate(_mvMatrix, degToRad(-_camera.rot.y), [0, 1, 0]);
        mat4.translate(_mvMatrix, [-_camera.pos.x, -_camera.pos.y, _camera.pos.z]);
    };
    
    Matrix.prototype.setUniforms = function (gl, shaderProgram) {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, _pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, _mvMatrix);
        
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(_mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    };
    
    return Matrix;
})();