/* global vec3 */

// TODO: Error handling
var Shaders = (function () {
    var _gl;
    
    var light = {
        ambient: [0.3, 0.3, 0.3],
        directional: [0.5, 0.5, 0.5],
        specular: [1.0, 1.0, 1.0],
        direction: [-0.5, -0.7, -0.5]
    };
    
    function Shaders(gl) {
        _gl = gl;
    }
    
    function downloadShader(id, type) {
        var deferred = Q.defer();
        var http = new XMLHttpRequest();
        
        http.onreadystatechange = function () {
            if(http.readyState === 4 && http.status === 200) {
                deferred.resolve(http.responseText);
            }
        };
        
        http.open('GET', '/shaders/' + id + '.' + type + '?rnd=' + Math.random() * 1000);
        http.send();
        
        return deferred.promise;
    }
    
    function createShader(id, ext, type) {
        var deferred = Q.defer();
        
        downloadShader(id, ext).then(function (shaderData) {
            var shader = _gl.createShader(type);
            _gl.shaderSource(shader, shaderData);
            _gl.compileShader(shader);
            
            if(!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
                console.error(_gl.getShaderInfoLog(shader));
                deferred.reject(_gl.getShaderInfoLog(shader));
            } else {
                deferred.resolve(shader);
            }
        });
        
        return deferred.promise;
    }
    
    Shaders.prototype.downloadShaderProgram = function(name) {
        var deferred = Q.defer();

        createShader(name, 'fs', _gl.FRAGMENT_SHADER).then(function (fs) {
            createShader(name, 'vs', _gl.VERTEX_SHADER).then(function (vs) {
                var program = _gl.createProgram();
                
                _gl.attachShader(program, vs);
                _gl.attachShader(program, fs);
                
                deferred.resolve(program);
            });
        });  
        
        return deferred.promise;      
    };
    
    Shaders.prototype.setDefaults = function (shader) {
        shader.pMatrixUniform = _gl.getUniformLocation(shader, 'uPMatrix');
        shader.mvMatrixUniform = _gl.getUniformLocation(shader, 'uMVMatrix');
        shader.nMatrixUniform  = _gl.getUniformLocation(shader, 'uNMatrix');
        
        
        shader.ambientColor = _gl.getUniformLocation(shader, 'uAmbientColor');
        shader.directionalColor = _gl.getUniformLocation(shader, 'uDirectionalColor');
        shader.specularColor = _gl.getUniformLocation(shader, 'uSpecularColor');
        shader.lightDirection = _gl.getUniformLocation(shader, 'uLightingDirection');
        shader.shininess = _gl.getUniformLocation(shader, 'uShininess');
        shader.specularWeight = _gl.getUniformLocation(shader, 'uSpecularWeight');
        
        _gl.uniform3f(shader.ambientColor, light.ambient[0], light.ambient[1], light.ambient[2]);
        _gl.uniform3f(shader.directionalColor, light.directional[0], light.directional[1], light.directional[2]);
        _gl.uniform3f(shader.specularColor, light.specular[0], light.specular[1], light.specular[2]);
        
        var adjustedLightDir = vec3.create();      
        vec3.normalize(adjustedLightDir, light.direction);
        vec3.scale(adjustedLightDir, adjustedLightDir, -1);
        _gl.uniform3fv(shader.lightDirection, adjustedLightDir);
    };
    
    
    return Shaders;
    
})();