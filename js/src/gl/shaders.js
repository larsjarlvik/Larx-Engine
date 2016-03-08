"use strict";

class LarxShader {
    
    constructor() {
        this.light = {
            ambient: [0.3, 0.3, 0.3],
            directional: [0.5, 0.5, 0.5],
            specular: [1.0, 1.0, 1.0],
            direction: [-0.5, -0.7, -0.5]
        };
    }

    downloadShader(id, type) {
        let deferred = Q.defer();
        let http = new XMLHttpRequest();
        
        http.onreadystatechange = () => {
            if(http.readyState === 4 && http.status === 200) {
                deferred.resolve(http.responseText);
            }
        };
        
        http.open('GET', '/shaders/' + id + '.' + type + '?rnd=' + Math.random() * 1000);
        http.send();
        
        return deferred.promise;
    }

    createShader(id, ext, type) {
        let deferred = Q.defer();

        this.downloadShader(id, ext).then((shaderData) => {
            let shader = Larx.gl.createShader(type);
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
    }

    downloadShaderProgram(name) {
        let deferred = Q.defer();
        
        this.createShader(name, 'fs', Larx.gl.FRAGMENT_SHADER).then((fs) => {
            this.createShader(name, 'vs', Larx.gl.VERTEX_SHADER).then((vs) => {
                let program = Larx.gl.createProgram();
                
                Larx.gl.attachShader(program, vs);
                Larx.gl.attachShader(program, fs);
                
                deferred.resolve(program);
            });
        });  
        
        return deferred.promise;      
    }

    setDefaults(shader, useLights) {
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
            
            Larx.gl.uniform3f(shader.ambientColor, this.light.ambient[0], this.light.ambient[1], this.light.ambient[2]);
            Larx.gl.uniform3f(shader.directionalColor, this.light.directional[0], this.light.directional[1], this.light.directional[2]);
            Larx.gl.uniform3f(shader.specularColor, this.light.specular[0], this.light.specular[1], this.light.specular[2]);
            
            let adjustedLightDir = vec3.create();      
            vec3.normalize(adjustedLightDir, this.light.direction);
            vec3.scale(adjustedLightDir, adjustedLightDir, -1);
            Larx.gl.uniform3fv(shader.lightDirection, adjustedLightDir);
        }
    }

    get() {
        return this.shader;
    }
};
        
    