'use strict';

class LarxBaseEffect {
	constructor(scale) {
		this.scale = scale;
		
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
	
	resize() {
		this.setSize();
		this.framebuffer.width = this.width;
		this.framebuffer.height = this.height;
		this.framebuffer.build();
		this.framebuffer.buildColorBuffer(Larx.gl.UNSIGNED_BYTE, true);
		this.shader.setResolution(this.width, this.height);
	}
	
	init() {
		this.setSize();
		this.buildFramebuffer();
		this.model.bindBuffers();
	}
	
	buildFramebuffer() {
		this.framebuffer = new LarxFramebuffer(this.width, this.height);
		this.framebuffer.buildColorBuffer(Larx.gl.UNSIGNED_BYTE, true);
	}
}