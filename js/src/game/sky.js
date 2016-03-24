'use strict';

class LarxSky {
	constructor(size) {
		this.size = size;
		this.model;
	}
	
	load(name) {
		return new Promise((resolve, reject) => {
			this.model = new LarxModel();
			this.model.load(name).then(() => {
				this.model.scale(this.size, this.size / 2, this.size);
				this.model.bindBuffers();
				resolve();
			})
			.catch(function (err) { 
				reject(err); 
			});
		});
	}

	render(shader) {
		Larx.Matrix.setIdentity(Larx.Camera.getMatrix());
		Larx.Matrix.translate([Larx.Camera.look.x, -350.0, Larx.Camera.look.z]);
		Larx.Matrix.setUniforms(shader);
		
		this.model.render(shader);
	}
}