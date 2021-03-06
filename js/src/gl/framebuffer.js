'use strict';

class LarxFramebuffer {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		
		this.framebuffer = Larx.gl.createFramebuffer();
		this.renderbuffer = Larx.gl.createRenderbuffer();
		
		this.colorTexture;
		this.depthTexture;
		
		this.build();
	}
	
	build() {
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, this.framebuffer);
		Larx.gl.bindRenderbuffer(Larx.gl.RENDERBUFFER, this.renderbuffer);
		
		Larx.gl.renderbufferStorage(Larx.gl.RENDERBUFFER, Larx.gl.DEPTH_COMPONENT16, this.width, this.height);
		Larx.gl.framebufferRenderbuffer(Larx.gl.FRAMEBUFFER, Larx.gl.DEPTH_ATTACHMENT, Larx.gl.RENDERBUFFER, this.renderbuffer);
		Larx.gl.framebufferRenderbuffer(Larx.gl.FRAMEBUFFER, Larx.gl.DEPTH_ATTACHMENT, Larx.gl.RENDERBUFFER, this.renderbuffer);
		
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, null);
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, null);
	}
	
	buildColorBuffer(format, clamp) {
		this.colorTexture = Larx.gl.createTexture();
		
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, this.framebuffer);
		
		Larx.gl.bindTexture(Larx.gl.TEXTURE_2D, this.colorTexture);
		Larx.gl.texImage2D(Larx.gl.TEXTURE_2D, 0, Larx.gl.RGBA, this.width, this.height, 0, Larx.gl.RGBA, format, null);
		Larx.gl.texParameteri(Larx.gl.TEXTURE_2D, Larx.gl.TEXTURE_MAG_FILTER, Larx.gl.LINEAR);
		Larx.gl.texParameteri(Larx.gl.TEXTURE_2D, Larx.gl.TEXTURE_MIN_FILTER, Larx.gl.LINEAR);
		
		if(clamp) {
			Larx.gl.texParameteri(Larx.gl.TEXTURE_2D, Larx.gl.TEXTURE_WRAP_S, Larx.gl.CLAMP_TO_EDGE);
			Larx.gl.texParameteri(Larx.gl.TEXTURE_2D, Larx.gl.TEXTURE_WRAP_T, Larx.gl.CLAMP_TO_EDGE);
		}
		
		Larx.gl.framebufferTexture2D(Larx.gl.FRAMEBUFFER, Larx.gl.COLOR_ATTACHMENT0, Larx.gl.TEXTURE_2D, this.colorTexture, 0);
			
		Larx.gl.bindTexture(Larx.gl.TEXTURE_2D, null);
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, null);
	}
	
	buildDepthBuffer() {
		this.depthTexture = Larx.gl.createTexture();
		
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, this.framebuffer);
		
		Larx.gl.bindTexture(Larx.gl.TEXTURE_2D, this.depthTexture);
		Larx.gl.texParameteri(Larx.gl.TEXTURE_2D, Larx.gl.TEXTURE_MAG_FILTER, Larx.gl.NEAREST);
		Larx.gl.texParameteri(Larx.gl.TEXTURE_2D, Larx.gl.TEXTURE_MIN_FILTER, Larx.gl.NEAREST);
		Larx.gl.texImage2D(Larx.gl.TEXTURE_2D, 0, Larx.gl.DEPTH_COMPONENT, this.width, this.height, 0, Larx.gl.DEPTH_COMPONENT, Larx.gl.UNSIGNED_INT, null);

		Larx.gl.bindTexture(Larx.gl.TEXTURE_2D, null);
		Larx.gl.bindRenderbuffer(Larx.gl.RENDERBUFFER, null);
	}
	
	bind(clear) {
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, this.framebuffer);
		Larx.gl.viewport(0, 0, this.width, this.height);
		
		if(clear) {
			Larx.gl.clear(Larx.gl.COLOR_BUFFER_BIT | Larx.gl.DEPTH_BUFFER_BIT);
		}
			
		if(this.colorTexture) { 
			Larx.gl.framebufferTexture2D(Larx.gl.FRAMEBUFFER, Larx.gl.COLOR_ATTACHMENT0, Larx.gl.TEXTURE_2D, this.colorTexture, 0);
		}
		
		if(this.depthTexture) { 
			Larx.gl.framebufferTexture2D(Larx.gl.FRAMEBUFFER, Larx.gl.DEPTH_ATTACHMENT, Larx.gl.TEXTURE_2D, this.depthTexture, 0);
		}
	}
	
	unbind() {
		Larx.PostProcessing.bind();
	}
	
	bindColorTexture(textureUnit) {
		Larx.gl.activeTexture(textureUnit);
		Larx.gl.bindTexture(Larx.gl.TEXTURE_2D, this.colorTexture);  
	}

	bindDepthTexture(textureUnit) {
		Larx.gl.activeTexture(textureUnit);
		Larx.gl.bindTexture(Larx.gl.TEXTURE_2D, this.depthTexture);  
	}

	unbindTexture(textureUnit) {
		Larx.gl.bindTexture(Larx.gl.TEXTURE_2D, null);  
	}
}