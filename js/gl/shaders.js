/* global Larx */
/* global vec3 */

Larx.Shaders = {
    light: {
        ambient: [0.3, 0.3, 0.3],
        directional: [0.5, 0.5, 0.5],
        specular: [1.0, 1.0, 1.0],
        direction: [-0.5, -0.7, -0.5]
    },

    downloadShader: function(id, type) {
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
    },

    createShader: function(id, ext, type) {
        var deferred = Q.defer();
        
        Larx.Shaders.downloadShader(id, ext).then(function (shaderData) {
            var shader = Larx.gl.createShader(type);
            Larx.gl.shaderSource(shader, shaderData);
            Larx.gl.compileShader(shader);
            
            if(!Larx.gl.getShaderParameter(shader, Larx.gl.COMPILE_STATUS)) {
                console.error(id, ext);
                console.error(Larx.gl.getShaderInfoLog(shader));
                deferred.reject(Larx.gl.getShaderInfoLog(shader));
            } else {
                deferred.resolve(shader);
            }
        });
        
        return deferred.promise;
    },

    downloadShaderProgram: function(name) {
        var deferred = Q.defer();

        Larx.Shaders.createShader(name, 'fs', Larx.gl.FRAGMENT_SHADER).then(function (fs) {
            Larx.Shaders.createShader(name, 'vs', Larx.gl.VERTEX_SHADER).then(function (vs) {
                var program = Larx.gl.createProgram();
                
                Larx.gl.attachShader(program, vs);
                Larx.gl.attachShader(program, fs);
                
                deferred.resolve(program);
            });
        });  
        
        return deferred.promise;      
    },

    setDefaults: function (shader, useLights) {
        shader.pMatrixUniform = Larx.gl.getUniformLocation(shader, 'uPMatrix');
        shader.mvMatrixUniform = Larx.gl.getUniformLocation(shader, 'uMVMatrix');
        shader.nMatrixUniform  = Larx.gl.getUniformLocation(shader, 'uNMatrix');
        
        shader.vertexPositionAttribute = Larx.gl.getAttribLocation(shader, 'aVertexPosition');
        Larx.gl.enableVertexAttribArray(shader.vertexPositionAttribute);
        
        if(useLights) {
            shader.ambientColor = Larx.gl.getUniformLocation(shader, 'uAmbientColor');
            shader.directionalColor = Larx.gl.getUniformLocation(shader, 'uDirectionalColor');
            shader.specularColor = Larx.gl.getUniformLocation(shader, 'uSpecularColor');
            shader.lightDirection = Larx.gl.getUniformLocation(shader, 'uLightingDirection');
            shader.shininess = Larx.gl.getUniformLocation(shader, 'uShininess');
            shader.specularWeight = Larx.gl.getUniformLocation(shader, 'uSpecularWeight');
            
            Larx.gl.uniform3f(shader.ambientColor, Larx.Shaders.light.ambient[0], Larx.Shaders.light.ambient[1], Larx.Shaders.light.ambient[2]);
            Larx.gl.uniform3f(shader.directionalColor, Larx.Shaders.light.directional[0], Larx.Shaders.light.directional[1], Larx.Shaders.light.directional[2]);
            Larx.gl.uniform3f(shader.specularColor, Larx.Shaders.light.specular[0], Larx.Shaders.light.specular[1], Larx.Shaders.light.specular[2]);
            
            var adjustedLightDir = vec3.create();      
            vec3.normalize(adjustedLightDir, Larx.Shaders.light.direction);
            vec3.scale(adjustedLightDir, adjustedLightDir, -1);
            Larx.gl.uniform3fv(shader.lightDirection, adjustedLightDir);
        }
    }
};
        
    