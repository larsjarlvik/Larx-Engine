/* global vec3 */

var Shaders = function(ctx) {
    this.ctx = ctx;
    this.light = {
        ambient: [0.3, 0.3, 0.3],
        directional: [0.5, 0.5, 0.5],
        specular: [1.0, 1.0, 1.0],
        direction: [-0.5, -0.7, -0.5]
    };
};

Shaders.prototype._downloadShader = function(id, type) {
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
};

Shaders.prototype._createShader = function(id, ext, type) {
    var deferred = Q.defer();
    var gl = this.ctx.gl;
    
    this._downloadShader(id, ext).then(function (shaderData) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, shaderData);
        gl.compileShader(shader);
        
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(id, ext);
            console.error(gl.getShaderInfoLog(shader));
            deferred.reject(gl.getShaderInfoLog(shader));
        } else {
            deferred.resolve(shader);
        }
    });
    
    return deferred.promise;
};

Shaders.prototype.downloadShaderProgram = function(name) {
    var deferred = Q.defer();
    var self = this;
    var gl = this.ctx.gl;

    self._createShader(name, 'fs', gl.FRAGMENT_SHADER).then(function (fs) {
        self._createShader(name, 'vs', gl.VERTEX_SHADER).then(function (vs) {
            var program = gl.createProgram();
            
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            
            deferred.resolve(program);
        });
    });  
    
    return deferred.promise;      
};

Shaders.prototype.setDefaults = function (shader, useLights) {
    var gl = this.ctx.gl;
    
    shader.pMatrixUniform = gl.getUniformLocation(shader, 'uPMatrix');
    shader.mvMatrixUniform = gl.getUniformLocation(shader, 'uMVMatrix');
    shader.nMatrixUniform  = gl.getUniformLocation(shader, 'uNMatrix');
    
    if(useLights) {
        shader.ambientColor = gl.getUniformLocation(shader, 'uAmbientColor');
        shader.directionalColor = gl.getUniformLocation(shader, 'uDirectionalColor');
        shader.specularColor = gl.getUniformLocation(shader, 'uSpecularColor');
        shader.lightDirection = gl.getUniformLocation(shader, 'uLightingDirection');
        shader.shininess = gl.getUniformLocation(shader, 'uShininess');
        shader.specularWeight = gl.getUniformLocation(shader, 'uSpecularWeight');
        
        gl.uniform3f(shader.ambientColor, this.light.ambient[0], this.light.ambient[1], this.light.ambient[2]);
        gl.uniform3f(shader.directionalColor, this.light.directional[0], this.light.directional[1], this.light.directional[2]);
        gl.uniform3f(shader.specularColor, this.light.specular[0], this.light.specular[1], this.light.specular[2]);
        
        var adjustedLightDir = vec3.create();      
        vec3.normalize(adjustedLightDir, this.light.direction);
        vec3.scale(adjustedLightDir, adjustedLightDir, -1);
        gl.uniform3fv(shader.lightDirection, adjustedLightDir);
    }
};
    
    