/* global vec3 */

// TODO: Error handling
var Shaders = (function () {
    var _gl, _defaultShader;
    
    var light = {
        ambient: [0.3, 0.3, 0.3],
        directional: [0.5, 0.5, 0.5],
        specular: [0.75, 0.75, 0.75],
        direction: [-0.5, -1.0, -0.5]
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
                console.log(_gl.getShaderInfoLog(shader));
                deferred.reject(_gl.getShaderInfoLog(shader));
            } else {
                deferred.resolve(shader);
            }
        });
        
        return deferred.promise;
    }
    
   function downloadShaderProgram (name) {
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
    
    Shaders.prototype.initShaders = function () {
        
        var deferred = Q.defer();
        
        downloadShaderProgram('shader').then(function (shaderProgram) {    
            _defaultShader = shaderProgram;
            
            _gl.linkProgram(_defaultShader);
            _gl.useProgram(_defaultShader);
            
            // START BUFFERS
            _defaultShader.vertexPositionAttribute = _gl.getAttribLocation(_defaultShader, 'aVertexPosition');
            _gl.enableVertexAttribArray(_defaultShader.vertexPositionAttribute);
            
            _defaultShader.vertexColorAttribute = _gl.getAttribLocation(_defaultShader, 'aVertexColor');
            _gl.enableVertexAttribArray(_defaultShader.vertexColorAttribute);
            
            _defaultShader.vertexNormalAttribute = _gl.getAttribLocation(_defaultShader, 'aVertexNormal');
            _gl.enableVertexAttribArray(_defaultShader.vertexNormalAttribute);

            _defaultShader.pMatrixUniform = _gl.getUniformLocation(_defaultShader, 'uPMatrix');
            _defaultShader.mvMatrixUniform = _gl.getUniformLocation(_defaultShader, 'uMVMatrix');
            _defaultShader.nMatrixUniform  = _gl.getUniformLocation(_defaultShader, 'uNMatrix');
            
            _defaultShader.opacity = _gl.getUniformLocation(_defaultShader, 'uOpacity');
            // END BUFFERS
            
            // START LIGHTING
            _defaultShader.ambientColor = _gl.getUniformLocation(_defaultShader, 'uAmbientColor');
            _defaultShader.directionalColor = _gl.getUniformLocation(_defaultShader, 'uDirectionalColor');
            _defaultShader.specularColor = _gl.getUniformLocation(_defaultShader, 'uSpecularColor');
            _defaultShader.lightDirection = _gl.getUniformLocation(_defaultShader, 'uLightingDirection');
            _defaultShader.shininess = _gl.getUniformLocation(_defaultShader, 'uShininess');
            _defaultShader.specularWeight = _gl.getUniformLocation(_defaultShader, 'uSpecularWeight');
            
            _gl.uniform3f(_defaultShader.ambientColor, light.ambient[0], light.ambient[1], light.ambient[2]);
            _gl.uniform3f(_defaultShader.directionalColor, light.directional[0], light.directional[1], light.directional[2]);
            _gl.uniform3f(_defaultShader.specularColor, light.specular[0], light.specular[1], light.specular[2]);
            
            var adjustedLightDir = vec3.create();      
            vec3.normalize(adjustedLightDir, light.direction);
            vec3.scale(adjustedLightDir, adjustedLightDir, -1);
            _gl.uniform3fv(_defaultShader.lightDirection, adjustedLightDir);
            // END LIGHTING
            
            deferred.resolve();
        });
        
        return deferred.promise;
    };
    
    Shaders.prototype.get = function () {
        return {
            default: _defaultShader
        };
    };
    
    
    return Shaders;
    
})();