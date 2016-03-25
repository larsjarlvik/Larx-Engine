'use strict';

class LarxPostProcessingShader extends LarxShader {
	constructor() {
		super();
	}
	
	load() {
		return new Promise((resolve, reject) => {
			this.downloadShaderProgram('post-processing').then((shaderProgram) => {    
				this.shader = shaderProgram;
				
				Larx.gl.linkProgram(this.shader);
				Larx.gl.useProgram(this.shader);
				
				// SHARED
				this.shader.vertexPositionAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexPosition');
				this.shader.texture = Larx.gl.getUniformLocation(this.shader, 'uTexture');
				this.shader.resolution = Larx.gl.getUniformLocation(this.shader, 'uResolution');
				
				// FXAA
				this.shader.enableFXAAVS = Larx.gl.getUniformLocation(this.shader, 'uEnableFXAAVS');
				this.shader.enableFXAAFS = Larx.gl.getUniformLocation(this.shader, 'uEnableFXAAFS');
				
				
				this.setDefaults(this.shader, false);
				
				resolve();
			}).catch(function (e) {
				console.error(e);
				reject(e);
			});
		});
	}
	
	use() {
		Larx.gl.useProgram(this.shader);
	}
	
	setTexture(index) {
		Larx.gl.uniform1i(this.shader.texture, index);  
	}
	
	setResolution(w, h) {
		Larx.gl.uniform2f(this.shader.resolution, w, h);
	}
	
	enableFxaa(quality) {
		Larx.gl.uniform1i(this.shader.enableFXAAVS, 1);
		Larx.gl.uniform1i(this.shader.enableFXAAFS, 1);
	}
}

