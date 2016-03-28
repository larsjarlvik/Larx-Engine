'use strict';

class LarxPostProcessing extends LarxBaseEffect {
	constructor() {
		super(1.0);
		
		this.effects = {
			fxaa: {
				enabled: false,
				target: undefined
			},
			bloom: {
				enabled: false,
				target: new LarxBloomEffect()
			}
		};
	}
	
	init() {
		super.init();
		
		return new Promise((resolve) => {
			this.shader = new LarxPostProcessingShader();
			this.shader.load().then(() => {
				this.shader.setResolution(this.width, this.height);
				resolve();	
			});
		});
	}
	
	initEffects() {
		let promises = [];
		
		for(let prop in this.effects) {
			if (!this.effects.hasOwnProperty(prop) || 
				!this.effects[prop].enabled ||
				!this.effects[prop].target) { continue; }
			
			promises.push(this.effects[prop].target.init());
		}
		
		return Promise.all(promises);
	}
	
	renderEffects() {
		for(let prop in this.effects) {
			if (!this.effects.hasOwnProperty(prop) || 
				!this.effects[prop].enabled ||
				!this.effects[prop].target) { continue; }
			this.effects[prop].target.render();
		}
	}
	
	bind() {
		Larx.gl.viewport(0, 0, this.width, this.height);
		this.framebuffer.bindColorTexture(Larx.gl.TEXTURE7);
		this.framebuffer.bindDepthTexture(Larx.gl.TEXTURE6);
		this.framebuffer.bind(false);
		
		return (Larx.gl.checkFramebufferStatus(Larx.gl.FRAMEBUFFER) == Larx.gl.FRAMEBUFFER_COMPLETE);
	}
	
	render() {
		this.renderEffects();
		
		Larx.gl.viewport(0, 0, Larx.gl.viewportWidth, Larx.gl.viewportHeight);
		Larx.gl.bindFramebuffer(Larx.gl.FRAMEBUFFER, null);
				
		this.shader.use();
		this.shader.setColorTexture(7);
		this.shader.setDepthTexture(7);
		
		this.model.render(this.shader);
		this.framebuffer.unbindTexture(6);
		this.framebuffer.unbindTexture(7);
	}
	
	// Processors
	enableFXAA() {
		this.effects.fxaa.enabled = true;
		this.shader.enableFxaa();
	}
	
	enableBloom(bloomColor) {
		this.effects.bloom.enabled = true;
		this.shader.enableBloom(bloomColor);
	}
}