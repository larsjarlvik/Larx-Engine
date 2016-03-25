'use strict';

class LarxWater {
	constructor () {
		this.size = undefined;
		this.waveHeight = 0.25;
		this.speed = 0.01;
		this.frames = [];
		this.refraction;
		this.reflection;      
		
		this.time = 0;
		this.currentFrame = 0;  
	}
	
	build(terrain) {
		this.size = terrain.getSize() - (terrain.scale * 2);
		
		let tileCount = Math.floor(this.size / (100 / this.quality));
		let ts = this.size / tileCount;
				
		let frameTime = (1000.0 / this.fps);
		let target;
		
		for(let i = 0; i < Math.PI / this.speed; i += frameTime) {
			let tx = i * this.speed;
			let frame = new LarxModelBlock(this.size, 2);
			
			for(let z = 0; z < tileCount; z++) {
				let vz = (z * ts) - (this.size / 2);
					
				for(let x = 0; x < tileCount; x++) {
					let m = new LarxModel();
			
					m.normals = [];
					m.opacity = 0.5;
					
					let vx = (x * ts) - (this.size / 2);
					
					let y1 = Math.sin(tx + vx + ts) * Math.cos(tx + vz) * this.waveHeight;
					let y2 = Math.sin(tx + vx) * Math.cos(tx + vz) * this.waveHeight;
					let y3 = Math.sin(tx + vx) * Math.cos(tx + vz + ts) * this.waveHeight;
					let y4 = Math.sin(tx + vx + ts) * Math.cos(tx + vz + ts) * this.waveHeight;
					
					if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
						m.vertices = m.vertices.concat([vx + ts, y1, vz]);
						m.vertices = m.vertices.concat([vx,      y2, vz]);
						m.vertices = m.vertices.concat([vx,      y3, vz + ts]);
						
						m.vertices = m.vertices.concat([vx + ts, y1, vz]);
						m.vertices = m.vertices.concat([vx,      y3, vz + ts]);
						m.vertices = m.vertices.concat([vx + ts, y4, vz + ts]);
					} else {
						m.vertices = m.vertices.concat([vx + ts, y4, vz + ts]);
						m.vertices = m.vertices.concat([vx,      y2, vz]);
						m.vertices = m.vertices.concat([vx,      y3, vz + ts]);
						
						m.vertices = m.vertices.concat([vx + ts, y1, vz]);
						m.vertices = m.vertices.concat([vx,      y2, vz]);
						m.vertices = m.vertices.concat([vx + ts, y4, vz + ts]);
					}
					
					var add = false;
					for(var n = 0; n < m.vertices.length; n+=3) {
						if(terrain.getElevationAtPoint(m.vertices[n], m.vertices[n + 2]) <= this.waveHeight) {
							add = true;
							break;
						}
					}
						
					if(!add) { continue; }
					
					m.vertexCount = 6;
					m.faceCount = 2;

					m.indices.push(0);
					m.indices.push(1);
					m.indices.push(2);
					
					m.indices.push(3);
					m.indices.push(4);
					m.indices.push(5);
					
					m.calculateNormals();
					m.setBounds();

					frame.push(m);
				}
			}
			
			frame.bind();
			this.frames.push(frame);
		}
	}
	
	generate(terrain, quality, fps) {
		this.fps = fps;
		this.quality = quality;
		this.size = terrain.getSize() - (2 * terrain.scale) - 0.5;
		
		this.build(terrain);
		
		return Promise.resolve();
	}
	
	update(delta) {
		this.time += delta / 1000;
		this.time = this.time;
		
		this.currentFrame = Math.floor(this.fps * this.time);
		this.currentFrame = this.currentFrame % this.frames.length;
	}
	
	render(sp) { 
		Larx.gl.uniform1f(sp.shader.shininess, 6.0);
		Larx.gl.uniform1f(sp.shader.specularWeight, 0.5);
		   
		if(this.refraction) {
			this.refraction.bindDepthTexture(Larx.gl.TEXTURE0);
			this.refraction.bindColorTexture(Larx.gl.TEXTURE1);
			sp.setRefractionDepthTexture(this.refraction.depthTexture);
			sp.setRefractionColorTexture(this.refraction.colorTexture);
		}
		
		if(this.reflection) {
			this.reflection.bindColorTexture(Larx.gl.TEXTURE2);
			sp.setReflectionColorTexture(this.reflection.colorTexture);
		}
		
		this.frames[this.currentFrame].render(sp);
		
		if(this.refraction) { this.refraction.unbindTexture(Larx.gl.TEXTURE0); this.refraction.unbindTexture(Larx.gl.TEXTURE1); }
		if(this.reflection) { this.reflection.unbindTexture(Larx.gl.TEXTURE2); }
	}
};
