'use strict';

class LarxPostProcessing {
	constructor() {
		this.scale = 1.0;
		
		this.shader = undefined;
		this.model = new LarxModel();
		this.model.vertices = [
			-1.0, -1.0,  1.0,
			1.0, -1.0,  1.0,
			1.0,  1.0,  1.0,
			-1.0,  1.0,  1.0,
		];
		
		this.model.indices = [ 0, 1, 2, 0, 2, 3 ];
	}
	
	setSize() {
		this.width = Larx.gl.viewportWidth * this.scale;
		this.height = Larx.gl.viewportHeight * this.scale;
	}
	
	init() {
		return new Promise((resolve) => {
			this.setSize();
			this.buildFramebuffer();
			this.model.bindBuffers();
			
			this.shader = new LarxPostProcessingShader();
			this.shader.load().then(() => {
				this.shader.setResolution(this.width, this.height);
				resolve();	
			});
		});
	}
	
	buildFramebuffer() {
		this.framebuffer = new LarxFramebuffer(this.width, this.height);
		this.framebuffer.buildColorBuffer(Larx.gl.UNSIGNED_BYTE, true);
	}
	
	resize() {
		this.setSize();
		this.framebuffer.width = this.width;
		this.framebuffer.height = this.height;
		this.framebuffer.build();
		this.framebuffer.buildColorBuffer(Larx.gl.UNSIGNED_BYTE, true);
		this.shader.setResolution(this.width, this.height);
	}
	
	bind() {
		Larx.gl.viewport(0, 0, this.width, this.height);
		this.framebuffer.bindColorTexture(Larx.gl.TEXTURE7);
		this.framebuffer.bind(false);
		
		return (Larx.gl.checkFramebufferStatus(Larx.gl.FRAMEBUFFER) == Larx.gl.FRAMEBUFFER_COMPLETE);
	}
	
	draw() {
		Larx.gl.disable(Larx.gl.DEPTH_TEST);
		Larx.gl.viewport(0, 0, Larx.gl.viewportWidth, Larx.gl.viewportHeight);
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, null);
				
		this.shader.use();
		this.shader.setTexture(7);
		
		this.model.render(this.shader);
		this.framebuffer.unbindTexture(7);
	}
	
	// Processors
	enableFXAA() {
		this.shader.enableFxaa();
	}
}