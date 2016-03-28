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
				this.shader.colorTexture = Larx.gl.getUniformLocation(this.shader, 'uColorTexture');
				this.shader.depthTexture = Larx.gl.getUniformLocation(this.shader, 'uDepthTexture');
				this.shader.resolution = Larx.gl.getUniformLocation(this.shader, 'uResolution');
				
				// FXAA
				this.shader.enableFXAAVS = Larx.gl.getUniformLocation(this.shader, 'uEnableFXAAVS');
				this.shader.enableFXAAFS = Larx.gl.getUniformLocation(this.shader, 'uEnableFXAAFS');
				
				// Bloom
				this.shader.bloomTexture = Larx.gl.getUniformLocation(this.shader, 'uBloomTexture');
				this.shader.enableBloom = Larx.gl.getUniformLocation(this.shader, 'uEnableBloom');
				this.shader.bloomColor = Larx.gl.getUniformLocation(this.shader, 'uBloomColor');
				
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
	
	setColorTexture(index) {
		Larx.gl.uniform1i(this.shader.colorTexture, index);  
	}
	
	setDepthTexture(index) {
		Larx.gl.uniform1i(this.shader.depthTexture, index);  
	}
	
	setResolution(w, h) {
		Larx.gl.uniform2f(this.shader.resolution, w, h);
	}
	
	enableFxaa() {
		Larx.gl.uniform1i(this.shader.enableFXAAVS, 1);
		Larx.gl.uniform1i(this.shader.enableFXAAFS, 1);
	}
	
	enableBloom(bloomColor) {
		Larx.gl.uniform1i(this.shader.bloomTexture, 6);  
		Larx.gl.uniform1i(this.shader.enableBloom, 1);
		Larx.gl.uniform4f(this.shader.bloomColor, bloomColor[0], bloomColor[1], bloomColor[2], bloomColor[3]);
	}
}

