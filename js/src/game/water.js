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
	
	buildPoints(terrain, tileCount, tileSize) {
		let points = new Array(tileCount);
		
		for(let x = 0; x < tileCount; x++) {
			points[x] = new Array(tileCount);
		}
	
		for(let z = 0; z < tileCount; z++) {
			let vz = (z * tileSize) - (this.size / 2);
			
			for(let x = 0; x < tileCount; x++) {
				let vx = (x * tileSize) - (this.size / 2);
				let elev = -terrain.getElevationAtPoint(vx, vz);
				
				points[x][z] = {
					v: [vx, 0, vz],
					elev: elev
				};
			}
		}
		
		return points;
	}
	
	setWaveHeight(points, frame, tileCount) {
		let tx = frame * this.speed;
		let tx2 = frame * this.speed;
		let l1 = 3.0;
		let l2 = 1.0;
		
		for(let z = 0; z < tileCount; z++) {
			for(let x = 0; x < tileCount; x++) {
				points[x][z].v[1] = Math.sin((tx + points[x][z].v[0]) * l1) * Math.cos((tx + points[x][z].v[2]) * l1) * this.waveHeight;
				points[x][z].v[1] += Math.sin((tx2 + points[x][z].v[0]) * l2) * Math.cos((tx2 + points[x][z].v[2]) * l2) * this.waveHeight;
				points[x][z].v[1] *= points[x][z].elev / 5.0 + 0.5;
			}
		}
	}
	
	build(terrain) {
		this.size = terrain.getSize() - (terrain.scale * 2);
		
		let tileCount = Math.floor(this.size / (100 / this.quality));
		let tileSize = this.size / tileCount;
				
		let frameTime = (1000.0 / this.fps);
		let target;
		
		let points = this.buildPoints(terrain, tileCount + 1, tileSize);
		
		for(let i = 0; i < Math.PI / this.speed; i += frameTime) {
			let frame = new LarxModelBlock(this.size, 2);
			this.setWaveHeight(points, i, tileCount);
			
			for(let z = 0; z < tileCount; z++) {
				for(let x = 0; x < tileCount; x++) {
					if (points[x    ][z    ].elev < this.waveHeight &&
						points[x + 1][z    ].elev < this.waveHeight &&
						points[x    ][z + 1].elev < this.waveHeight &&
						points[x + 1][z + 1].elev < this.waveHeight) {
							continue;
						}
					
					let m = new LarxModel();
					m.normals = [];
					m.opacity = 0.5;
					
					if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {						
						m.vertices = m.vertices.concat(points[x + 1][z    ].v);
						m.vertices = m.vertices.concat(points[x    ][z    ].v);
						m.vertices = m.vertices.concat(points[x    ][z + 1].v);
						
						m.vertices = m.vertices.concat(points[x + 1][z    ].v);
						m.vertices = m.vertices.concat(points[x    ][z + 1].v);
						m.vertices = m.vertices.concat(points[x + 1][z + 1].v);
					} else {
						m.vertices = m.vertices.concat(points[x + 1][z + 1].v);
						m.vertices = m.vertices.concat(points[x    ][z    ].v);
						m.vertices = m.vertices.concat(points[x    ][z + 1].v);
						
						m.vertices = m.vertices.concat(points[x + 1][z    ].v);
						m.vertices = m.vertices.concat(points[x    ][z    ].v);
						m.vertices = m.vertices.concat(points[x + 1][z + 1].v);
					}
					
					
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
		Larx.gl.uniform1f(sp.shader.specularWeight, 0.25);
		   
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
