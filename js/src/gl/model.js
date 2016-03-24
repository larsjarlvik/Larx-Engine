"use strict";

class LarxModel {
	constructor() {
		this.vertices = [];
		this.colors;
		this.normals;
		this.texCoords;
		this.indices = [];
		this.shininess = 0;
		this.opacity = 1.0;
		this.specularWeight = 1.0;
		this.faceCount = 0;
		this.vertexCount = 0;
		
		this.bounds;
		this.frustumBounds;
	}
	
	setBounds() {
		this.bounds = {
			vMin: undefined,
			vMax: undefined
		};
		
		for(let i = 0; i < this.vertices.length; i += 3) {
			if(this.bounds.vMin === undefined) {
				this.bounds.vMin = [this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]];
			}
			
			if(this.bounds.vMax === undefined) {
				this.bounds.vMax = [this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]];
			}
			
			if(this.vertices[i + 0] < this.bounds.vMin[0]) { this.bounds.vMin[0] = this.vertices[i + 0]; }
			if(this.vertices[i + 0] > this.bounds.vMax[0]) { this.bounds.vMax[0] = this.vertices[i + 0]; }
			if(this.vertices[i + 1] < this.bounds.vMin[1]) { this.bounds.vMin[1] = this.vertices[i + 1]; }
			if(this.vertices[i + 1] > this.bounds.vMax[1]) { this.bounds.vMax[1] = this.vertices[i + 1]; }
			if(this.vertices[i + 2] < this.bounds.vMin[2]) { this.bounds.vMin[2] = this.vertices[i + 2]; }
			if(this.vertices[i + 2] > this.bounds.vMax[2]) { this.bounds.vMax[2] = this.vertices[i + 2]; }
		}
	}
	
	download(name) {
		return new Promise((resolve) => {
			let http = new XMLHttpRequest();
			
			http.onreadystatechange = function () {
				if(http.readyState === 4 && http.status === 200) {
					resolve(http.responseText);
				}
			};
			
			http.open('GET', '/models/' + name + '.ply?rnd=' + Math.random() * 1000);
			http.send();
		});
	}

	parse(data) {
		let self = this;
		let properties = [];

		function parseHeader(lines) {
			let propertyIndex = 0;
			
			for(let i = 0; i < lines.length; i ++) {
				let line = lines[i].trim();
				
				if(line.indexOf('property') == 0) {
					let headerValue = parseHeaderValue(line);
					
					switch(headerValue) {
						case 'x':
							properties['vertices'] = propertyIndex;
							break;
						case 'nx':
							properties['normals'] = propertyIndex;
							break;
						case 's':
							properties['texCoords'] = propertyIndex;
							break;
						case 'red':
							properties['colors'] = propertyIndex;
							break;
					}
					propertyIndex ++;
				}
				
				if(line.indexOf('element vertex') == 0) { self.vertexCount = parseInt(parseHeaderValue(line)); }
				if(line.indexOf('element face') == 0) { self.faceCount = parseInt(parseHeaderValue(line)); }
				if(line === 'end_header') { return i + 1; }
			}
		}
		
		function parseHeaderValue(line) {
			let n = line.split(' ');
			return n[n.length - 1];
		}
		
		function parseVertices(lines, start) {
			if(properties['vertices']  !== undefined) { self.vertices = []; }
			if(properties['normals']   !== undefined) { self.normals = []; }
			if(properties['colors']    !== undefined) { self.colors = []; }
			if(properties['texCoords'] !== undefined) { self.texCoords = []; }
			
			for(let i = start; i < start + self.vertexCount; i ++) {
				let values = lines[i].trim().split(' ');
				
				if(properties['vertices'] !== undefined) {
					self.vertices.push(parseFloat(values[properties['vertices']]));
					self.vertices.push(parseFloat(values[properties['vertices'] + 1]));
					self.vertices.push(parseFloat(values[properties['vertices'] + 2]));
				}
				
				if(properties['normals'] !== undefined) {
					self.normals.push(parseFloat(values[properties['normals']]));
					self.normals.push(parseFloat(values[properties['normals'] + 1]));
					self.normals.push(parseFloat(values[properties['normals'] + 2]));
				}
				
				if(properties['texCoords'] !== undefined) {
					self.texCoords.push(parseFloat(values[properties['texCoords']]));
					self.texCoords.push(parseFloat(values[properties['texCoords'] + 1]));
				}
				
				if(properties['colors'] !== undefined) {
					self.colors.push(parseFloat(values[properties['colors']]) / 256.0);
					self.colors.push(parseFloat(values[properties['colors'] + 1]) / 256.0);
					self.colors.push(parseFloat(values[properties['colors'] + 2]) / 256.0);
				}
			}
		}   

		function parseFaces(lines, start) {
			self.indices = [];

			for(let i = start; i < lines.length; i ++) {
				let values = lines[i].trim().split(' ');
				if(values.length !== 4) { continue; }
				
				self.indices.push(parseInt(values[1]));
				self.indices.push(parseInt(values[2]));
				self.indices.push(parseInt(values[3]));
			}
		}
		
		let lines = data.split('\n');
		let bodyStart = parseHeader(lines);
		
		parseVertices(lines, bodyStart);
		parseFaces(lines, bodyStart + this.vertexCount);
	}
	
	
	bindBuffers() {
		function bindBuffer(buffer, data, itemSize) {
			
			if(!data) { return; }
			if(!buffer) { buffer = Larx.gl.createBuffer();  }
			
			Larx.gl.bindBuffer(Larx.gl.ARRAY_BUFFER, buffer);
			Larx.gl.bufferData(Larx.gl.ARRAY_BUFFER, new Float32Array(data), Larx.gl.STATIC_DRAW);
			buffer.itemSize = itemSize;
			
			return buffer;
		}
		
		this.vertexBuffer = bindBuffer(this.vertexBuffer, this.vertices, 3);
		this.colorBuffer = bindBuffer(this.colorBuffer, this.colors, 3);
		this.normalBuffer = bindBuffer(this.normalBuffer, this.normals, 3);
		this.texCoordBuffer = bindBuffer(this.texCoordBuffer, this.texCoords, 2);
		
		if(!this.indexBuffer) { this.indexBuffer = Larx.gl.createBuffer(); }
		Larx.gl.bindBuffer(Larx.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		Larx.gl.bufferData(Larx.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), Larx.gl.STATIC_DRAW);
		this.indexBuffer.numItems = this.indices.length;
	}
	
	load (name) {
		return new Promise((resolve) => {            
			this.download(name).then((data) => {
				this.parse(data);
				this.bindBuffers();
				this.setBounds();
				resolve(); 
			})
			.catch(function(e) {
				console.error(e); 
				reject(e);
			});
		});
	}

	translate (pos) {    
		for(let i = 0; i < this.vertices.length; i += 3) {
			this.vertices[i] += pos[0];
			this.vertices[i + 1] += pos[1];
			this.vertices[i + 2] += pos[2];
		}
	}
	
	scale (value) {    
		for(let i = 0; i < this.vertices.length; i += 3) {
			this.vertices[i] *= value;
			this.vertices[i + 1] *= value;
			this.vertices[i + 2] *= value;
		}
	}

	rotate (angle) {
		let doRotate = (angle, a, b) => {
			let cosTheta = Math.cos(angle);
			let sinTheta = Math.sin(angle);
			
			for(let i = 0; i < this.vertices.length; i += 3) { 
				let av = cosTheta * (this.vertices[i + a]) - sinTheta*(this.vertices[i + b]);
				let bv = sinTheta * (this.vertices[i + a]) + cosTheta*(this.vertices[i + b]);
				
				this.vertices[i + a] = av;
				this.vertices[i + b] = bv;
				
				if(this.normals) {
					let an = cosTheta * (this.normals[i + a]) - sinTheta*(this.normals[i + b]);
					let bn = sinTheta * (this.normals[i + a]) + cosTheta*(this.normals[i + b]);
					
					this.normals[i + a] = an;
					this.normals[i + b] = bn;
				}
			}
		}
		
		doRotate(angle[0], 1, 2);
		doRotate(angle[1], 0, 2);
		doRotate(angle[2], 0, 1);
	}

	clone () {
		let target = new LarxModel();
		
		Array.prototype.push.apply(target.vertices, this.vertices);
		Array.prototype.push.apply(target.indices, this.indices);
		
		if(this.colors) {
			target.colors = [];
			Array.prototype.push.apply(target.colors, this.colors);
		}
		
		if(this.normals) {
			target.normals = [];
			Array.prototype.push.apply(target.normals, this.normals);
		}
		
		if(this.texCoords) {
			target.texCoords = [];
			Array.prototype.push.apply(target.texCoords, this.texCoords);
		}
		
		target.shininess = this.shininess;
		target.opacity = this.opacity;
		target.specularWeight = this.specularWeight;
		target.faceCount = this.faceCount;
		target.vertexCount = this.vertexCount;
		target.bounds = this.bounds;
		
		return target;
	}

	push(source) {
		for(let i = 0; i < source.indices.length; i++) {
			this.indices.push(source.indices[i] + this.vertexCount);
		}
		
		if(source.colors) { 
			if(!this.colors) { this.colors = []; }
			Array.prototype.push.apply(this.colors, source.colors); 
		}
		
		if(source.normals) { 
			if(!this.normals) { this.normals = []; }
			Array.prototype.push.apply(this.normals, source.normals); 
		}
		
		if(source.texCoords) { 
			if(!this.texCoords) { this.texCoords = []; }
			Array.prototype.push.apply(this.texCoords, source.texCoords); 
		}
		
		Array.prototype.push.apply(this.vertices, source.vertices);
		
		this.faceCount += source.faceCount;
		this.vertexCount += source.vertexCount;
	}
	
	calculateNormals () {
		function calcNormal(a, b, c, out) {
			let x,  y,  z,
				x1, y1, z1,
				x2, y2, z2,
				x3, y3, z3,
				len;

			x1 = c[0] - b[0];   y1 = c[1] - b[1];   z1 = c[2] - b[2];
			x2 = a[0] - b[0];   y2 = a[1] - b[1];   z2 = a[2] - b[2];
			
			x3 = y1 * z2 - z1 * y2;
			y3 = z1 * x2 - x1 * z2;
			z3 = x1 * y2 - y1 * x2;
			
			len = 1 / Math.sqrt(x3*x3 + y3*y3 + z3*z3);
			x = x3 * len;
			y = y3 * len;
			z = z3 * len;
			
			out[0] = x * len;
			out[1] = y * len;
			out[2] = z * len;
			
			vec3.normalize(out, out);
		}
		
		this.normals = Array(this.vertices.length);
		
		let v1 = [];
		let a, b, c;
		
		for (let i = 0; i < this.vertices.length; i += 9) {
			a = [this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]];
			b = [this.vertices[i + 3], this.vertices[i + 4], this.vertices[i + 5]];
			c = [this.vertices[i + 6], this.vertices[i + 7], this.vertices[i + 8]];
			
			calcNormal(a, b, c, v1);
			this.normals[i + 0] = v1[0];
			this.normals[i + 1] = v1[1];
			this.normals[i + 2] = v1[2];
			this.normals[i + 3] = v1[0];
			this.normals[i + 4] = v1[1];
			this.normals[i + 5] = v1[2];
			this.normals[i + 6] = v1[0];
			this.normals[i + 7] = v1[1];
			this.normals[i + 8] = v1[2];
		}
	}

	getSize() {
		return [
			this.bounds.vMax[0] - this.bounds.vMin[0], 
			this.bounds.vMax[1] - this.bounds.vMin[1], 
			this.bounds.vMax[2] - this.bounds.vMin[2]];
	}
	

	setAttribute(attribute, buffer) {
		if(buffer !== undefined && attribute != undefined) {
			Larx.gl.bindBuffer(Larx.gl.ARRAY_BUFFER, buffer);
			Larx.gl.vertexAttribPointer(attribute, buffer.itemSize, Larx.gl.FLOAT, false, 0, 0);
		}
	}
	
	render (sp) {
		if(!this.vertexBuffer) {
			return;
		}
		
		this.setAttribute(sp.shader.vertexPositionAttribute, this.vertexBuffer);
		this.setAttribute(sp.shader.vertexColorAttribute, this.colorBuffer);
		this.setAttribute(sp.shader.vertexNormalAttribute, this.normalBuffer);
		this.setAttribute(sp.shader.textureCoordAttribute, this.texCoordBuffer);

		Larx.gl.bindBuffer(Larx.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		Larx.gl.drawElements(Larx.gl.TRIANGLES, this.indexBuffer.numItems, Larx.gl.UNSIGNED_SHORT, 0);
	}
};
	