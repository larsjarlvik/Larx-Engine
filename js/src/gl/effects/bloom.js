'use strict';

class LarxBloomEffect extends LarxBaseEffect {
	constructor() {
		super(0.3);
	}
	
	setSize() {
		this.width = Larx.gl.viewportWidth * this.scale;
		this.height = Larx.gl.viewportHeight * this.scale;
	}
	
	init() {
		super.init();
		
		return new Promise((resolve) => {
			this.shader = new LarxBloomShader();
			this.shader.load().then(() => {
				this.shader.setResolution(this.width, this.height);
				resolve();	
			});
		});
	}
	
	render() {
		Larx.gl.viewport(0, 0, this.width, this.height);
		this.framebuffer.bind(true);
		this.framebuffer.bindColorTexture(Larx.gl.TEXTURE6);
				
		this.shader.use();
		this.shader.setTexture(7);
		
		this.model.render(this.shader);
	}
}