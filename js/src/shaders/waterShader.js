'use strict';

class LarxWaterShader extends LarxShader {
	constructor() {
		super();
	}
	
	load() {
		return new Promise((resolve, reject) => {
			this.downloadShaderProgram('water').then((shaderProgram) => {    
				this.shader = shaderProgram;
				
				Larx.gl.linkProgram(this.shader);
				Larx.gl.useProgram(this.shader);
				
				this.buffers = {};
				
				this.shader.vertexNormalAttribute = Larx.gl.getAttribLocation(this.shader, 'aVertexNormal');
				
				this.shader.color = Larx.gl.getUniformLocation(this.shader, 'uColor');
				this.shader.time = Larx.gl.getUniformLocation(this.shader, 'uTime');
				
				this.shader.refractionDepthTexture = Larx.gl.getUniformLocation(this.shader, 'uRefractionDepthTexture');
				this.shader.refractionColorTexture = Larx.gl.getUniformLocation(this.shader, 'uRefractionColorTexture');
				this.shader.reflectionColorTexture = Larx.gl.getUniformLocation(this.shader, 'uReflectionColorTexture');
				
				this.shader.fogDensity = Larx.gl.getUniformLocation(this.shader, 'uFogDensity');
				this.shader.fogGradient = Larx.gl.getUniformLocation(this.shader, 'uFogGradient');
				this.shader.fogColor = Larx.gl.getUniformLocation(this.shader, 'uFogColor');
				
				this.shader.distortion = Larx.gl.getUniformLocation(this.shader, 'uDistortion');
				this.shader.edgeWhitening = Larx.gl.getUniformLocation(this.shader, 'uEdgeWhitening');
				this.shader.edgeSoftening = Larx.gl.getUniformLocation(this.shader, 'uEdgeSoftening');
				this.shader.waterDensity = Larx.gl.getUniformLocation(this.shader, 'uWaterDensity');
				
				this.shader.nearPlane = Larx.gl.getUniformLocation(this.shader, 'uNearPlane');
				this.shader.farPlane = Larx.gl.getUniformLocation(this.shader, 'uFarPlane');
				
				this.setDefaults(this.shader, true);
				
				resolve();
			}).catch(function (e) {
				console.error(e);
				reject(e);
			});
		});
	}

	use() {
		Larx.gl.useProgram(this.shader);
		Larx.gl.enableVertexAttribArray(this.shader.vertexNormalAttribute);
	} 

	cleanUp() {
		Larx.gl.disableVertexAttribArray(this.shader.vertexNormalAttribute);
	}

	setWaterColor(color) {
		Larx.gl.uniform3f(this.shader.color, color[0], color[1], color[2]);
	}

	update(time) {
		Larx.gl.uniform1f(this.shader.time, time);
	}

	setRefractionDepthTexture(index) {
		Larx.gl.uniform1i(this.shader.refractionDepthTexture, 0);  
	}

	setRefractionColorTexture(index) {
		Larx.gl.uniform1i(this.shader.refractionColorTexture, 1);  
	}

	setReflectionColorTexture(index) {
		Larx.gl.uniform1i(this.shader.reflectionColorTexture, 2);  
	}

	setDistortion(value) {
		Larx.gl.uniform1f(this.shader.distortion, value);  
	}

	setEdgeWhitening(value) {
		Larx.gl.uniform1f(this.shader.edgeWhitening, value);  
	}
	
	setEdgeSoftening(value) {
		Larx.gl.uniform1f(this.shader.edgeSoftening, value);  
	}
	
	setDensity(value) {
		Larx.gl.uniform1f(this.shader.waterDensity, value);  
	}

	setFog(density, gradient, color) {
		Larx.gl.uniform1f(this.shader.fogDensity, density);
		Larx.gl.uniform1f(this.shader.fogGradient, gradient);
		Larx.gl.uniform3f(this.shader.fogColor, color[0], color[1], color[2]);
	}
	
	setNearFarPlane(near, far) {
		Larx.gl.uniform1f(this.shader.nearPlane, near);  
		Larx.gl.uniform1f(this.shader.farPlane, far);  
	}

}