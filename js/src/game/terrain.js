'use strict';

class LarxTerrain {
	constructor(scale) {
		this.heights;
		this.size;
		this.waterLevel;
		
		this.underwater;
		this.scale = scale;
		
		this.blocks;
		
		this.reflect = { NO: 0, YES: 1 };
		this.clip = { NONE: 0, TOP: 1, BOTTOM: 2 };
	}

	getSize() {
		return this.size * this.scale;
	}
	
	getColor(x, y) {    
		if(x >= this.size) { x = this.size - 1; }
		if(y >= this.size) { y = this.size - 1; }
		
		var xy = (y * this.colormap.size + x) * 4;
		return [
			this.colormap.data[xy] / 255,
			this.colormap.data[xy + 1] / 255,
			this.colormap.data[xy + 2] / 255];
	}
		
	setImageHeights() {
		var parsed = [];
		this.heights = new Array(this.size);
		
		for(var i = 0; i < this.heightmap.data.length; i += 4) {
			parsed.push(this.heightmap.data[i]);
		}
		
		for(var x = 0; x < this.size; x++) { 
			this.heights[x] = new Array(this.size); 
		}
		
		for(var z = 0; z < this.size; z++) {
			for(var x = 0; x < this.size; x++) {
				this.heights[x][z] = parsed[z * this.size + x] / 255 * this.elevation;
			}
		}
	}
	
	buildSquare(x, z, vx, vz, s) {
		const m = new LarxModel();

		m.colors = [];
		m.normals = [];

		if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
			m.vertices = m.vertices.concat([vx + s, this.getHeight(x + 1, z),    vz]);
			m.vertices = m.vertices.concat([vx,     this.getHeight(x, z),        vz]);
			m.vertices = m.vertices.concat([vx,     this.getHeight(x, z + 1),    vz + s]);
			
			m.colors = m.colors.concat(this.getColor(x + 1, z));
			m.colors = m.colors.concat(this.getColor(x, z));
			m.colors = m.colors.concat(this.getColor(x, z + 1));
			
			m.vertices = m.vertices.concat([vx + s, this.getHeight(x + 1, z),     vz]);
			m.vertices = m.vertices.concat([vx,     this.getHeight(x, z + 1),     vz + s]);
			m.vertices = m.vertices.concat([vx + s, this.getHeight(x + 1, z + 1), vz + s]);
			
			m.colors = m.colors.concat(this.getColor(x + 1, z));
			m.colors = m.colors.concat(this.getColor(x, z + 1));
			m.colors = m.colors.concat(this.getColor(x + 1, z + 1));
		} else {
			m.vertices = m.vertices.concat([vx + s, this.getHeight(x + 1, z + 1), vz + s]);
			m.vertices = m.vertices.concat([vx,     this.getHeight(x, z),         vz]);
			m.vertices = m.vertices.concat([vx,     this.getHeight(x, z + 1),     vz + s]);
			
			m.colors = m.colors.concat(this.getColor(x + 1, z + 1));
			m.colors = m.colors.concat(this.getColor(x, z));
			m.colors = m.colors.concat(this.getColor(x, z + 1));
			
			m.vertices = m.vertices.concat([vx + s, this.getHeight(x + 1, z),     vz]);
			m.vertices = m.vertices.concat([vx,     this.getHeight(x, z),         vz]);
			m.vertices = m.vertices.concat([vx + s, this.getHeight(x + 1, z + 1), vz + s]);
			
			m.colors = m.colors.concat(this.getColor(x + 1, z));
			m.colors = m.colors.concat(this.getColor(x, z));
			m.colors = m.colors.concat(this.getColor(x + 1, z + 1));
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

		this.blocks.push(m);
	}
	
	build() {      
		try {
			this.size = this.heightmap.size;
			this.setImageHeights();
			this.blocks = new LarxModelBlock(this.size * this.scale, 2);
			let s = this.scale;
			
			for(let z = 0; z < this.size; z++) {
				const vz = (z - (this.size / 2)) * s;
				
				for(let x = 0; x < this.size; x++) {
					const vx = (x - (this.size / 2)) * s;
					this.buildSquare(x, z, vx, vz, s);
				} 
			}
			
			this.blocks.bind();
		}catch(e) {
			console.error(e)
		}
	}
	
	generate(url, elevation, water) {
		return new Promise((resolve, reject) => {
			this.waterLevel = water;
			
			this.getImage(url + '/heightmap.jpg').then((imgHeightmap) => {
				this.getImage(url + '/colormap.jpg').then((imgColormap) => {
					
					this.heightmap = imgHeightmap;
					this.colormap = imgColormap;
					this.elevation = elevation;
					this.build(); 
					
					resolve();
				})
				.catch(function (e) { 
					console.error(e); 
					reject(e);
				});  
			});
		});
	}
	
	getElevationAtPoint(x, z) {
		var p = this.getPoint(x, z);       
		var v1, v2, v3;
		
		if(p.xc <= (1 - p.zc)) {
			v1 = [0, this.getHeight(p.gx, p.gz), 0];
			v2 = [1, this.getHeight(p.gx + 1, p.gz), 0];
			v3 = [0, this.getHeight(p.gx, p.gz + 1), 1];
		} else {
			v1 = [1, this.getHeight(p.gx + 1, p.gz), 0];
			v2 = [0, this.getHeight(p.gx, p.gz + 1), 1];
			v3 = [1, this.getHeight(p.gx + 1, p.gz + 1), 1];
		}

		return Larx.Math.baryCentric(v1, v2, v3, [p.xc, p.zc]);
	}
	
	getAngle(cx, cz, sx, sz) {
		var rx = sx / 2;
		var rz = sz / 2;
		
		return [
			Math.atan2(this.getElevationAtPoint(cx, cz - rz) - this.getElevationAtPoint(cx, cz + rz), sz),
			0,
			Math.atan2(this.getElevationAtPoint(cx + rx, cz) - this.getElevationAtPoint(cx - rx, cz), sx)
		];
	}
	
	getHeight(x, z) {
		if(x < 1 || x >= this.size || z < 1 || z >= this.size) {
			return -10.0;
		}
		
		return (this.heights[x][z] - this.waterLevel) * this.scale;
	}
	
	getImage(url) {  
		return new Promise((resolve, reject) => {
			var image = new Image();
			
			image.onload = () => {
				this.size = image.width;
				
				var canvas = document.createElement('canvas');
				canvas.setAttribute('width', this.size);
				canvas.setAttribute('height', this.size);
				
				var canvasCtx = canvas.getContext('2d');
				canvasCtx.drawImage(image, 0, 0);
				
				resolve({
					size: this.size,
					data: canvasCtx.getImageData(0, 0, this.size, this.size).data
				});
			};
			
			image.onerror = () => {
				reject('Failed to load: ' + url);
			};  
			
			image.src = url;
		});
	}
	
	
	getPoint(x, z) {
		x = (x + (this.getSize() / 2)) / this.scale;
		z = (z + (this.getSize() / 2)) / this.scale;
			
		return {
			gx: Math.floor(x),
			gz: Math.floor(z),
			xc: x % 1,
			zc: z % 1
		};
	}
	
	render(sp, reflect) {   
		Larx.gl.uniform1f(sp.shader.shininess, 1.0);
		Larx.gl.uniform1f(sp.shader.specularWeight, 0.1);
		
		this.blocks.render(sp);
	}
};