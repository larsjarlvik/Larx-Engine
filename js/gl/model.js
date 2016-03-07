
Larx.Model = function () {
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
};

Larx.Model.prototype = {
    setBounds: function() {
        this.bounds = {
            vMin: undefined,
            vMax: undefined
        };
        
        for(var i = 0; i < this.vertices.length; i += 3) {
            
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
    },
    
    download: function(name) {
        var deferred = Q.defer();
        var http = new XMLHttpRequest();
        
        http.onreadystatechange = function () {
            if(http.readyState === 4 && http.status === 200) {
                deferred.resolve(http.responseText);
            }
        };
        
        http.open('GET', '/models/' + name + '.ply?rnd=' + Math.random() * 1000);
        http.send();
        
        return deferred.promise;
    },

    parse: function(data) {
        var self = this;
        var properties = [];

        function parseHeader(lines) {
            var propertyIndex = 0;
            
            for(var i = 0; i < lines.length; i ++) {
                var line = lines[i].trim();
                
                if(line.indexOf('property') == 0) {
                    var headerValue = parseHeaderValue(line);
                    
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
            var n = line.split(' ');
            return n[n.length - 1];
        }
        
        function parseVertices(lines, start) {
            if(properties['vertices']  !== undefined) { self.vertices = []; }
            if(properties['normals']   !== undefined) { self.normals = []; }
            if(properties['colors']    !== undefined) { self.colors = []; }
            if(properties['texCoords'] !== undefined) { self.texCoords = []; }
            
            for(var i = start; i < start + self.vertexCount; i ++) {
                var values = lines[i].trim().split(' ');
                
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

            for(var i = start; i < lines.length; i ++) {
                var values = lines[i].trim().split(' ');
                if(values.length !== 4) { continue; }
                
                self.indices.push(parseInt(values[1]));
                self.indices.push(parseInt(values[2]));
                self.indices.push(parseInt(values[3]));
            }
        }
        
        var lines = data.split('\n');
        var bodyStart = parseHeader(lines);
        
        parseVertices(lines, bodyStart);
        parseFaces(lines, bodyStart + this.vertexCount);
    },
    
    bindBuffers: function() {
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
    },
    
    load: function (name) {
        var deferred = Q.defer();
        var self = this;
        
        self.download(name).then(function (data) {
            self.parse(data);
            self.bindBuffers();
            self.setBounds();
            deferred.resolve(); 
        })
        .catch(function(e) {
            console.error(e); 
            deferred.reject();
        });

        return deferred.promise;
    },

    translate: function (pos) {    
        for(var i = 0; i < this.vertices.length; i += 3) {
            this.vertices[i] += pos[0];
            this.vertices[i + 1] += pos[1];
            this.vertices[i + 2] += pos[2];
        }
    },

    scale: function (value) {    
        for(var i = 0; i < this.vertices.length; i += 3) {
            this.vertices[i] *= value;
            this.vertices[i + 1] *= value;
            this.vertices[i + 2] *= value;
        }
    },

    rotate: function (angle) {
        var self = this;
        
        function doRotate(angle, a, b) {
            var cosTheta = Math.cos(angle);
            var sinTheta = Math.sin(angle);
            
            for(var i = 0; i < self.vertices.length; i += 3) { 
                var av = cosTheta * (self.vertices[i + a]) - sinTheta*(self.vertices[i + b]);
                var bv = sinTheta * (self.vertices[i + a]) + cosTheta*(self.vertices[i + b]);
                
                self.vertices[i + a] = av;
                self.vertices[i + b] = bv;
                
                if(self.normals) {
                    var an = cosTheta * (self.normals[i + a]) - sinTheta*(self.normals[i + b]);
                    var bn = sinTheta * (self.normals[i + a]) + cosTheta*(self.normals[i + b]);
                    
                    self.normals[i + a] = an;
                    self.normals[i + b] = bn;
                }
            }
        }
        
        doRotate(angle[0], 1, 2);
        doRotate(angle[1], 0, 2);
        doRotate(angle[2], 0, 1);
    },

    clone: function () {
        var target = new Larx.Model();
        
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
        
        target.shininess = this.shininess;
        target.opacity = this.opacity;
        target.specularWeight = this.specularWeight;
        target.faceCount = this.faceCount;
        target.vertexCount = this.vertexCount;
        
        return target;
    },

    push: function(source) {
        for(var i = 0; i < source.indices.length; i++) {
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
        
        Array.prototype.push.apply(this.vertices, source.vertices);
        
        this.faceCount += source.faceCount;
        this.vertexCount += source.vertexCount;
    },
    
    calculateNormals: function () {
        function calcNormal(a, b, c, out) {
            var x,  y,  z,
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
        
        var v1 = [];
        var a, b, c;
        
        for (var i = 0; i < this.vertices.length; i += 9) {
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
    },

    getSize: function() {
        return [
            this.bounds.vMax[0] - this.bounds.vMin[0], 
            this.bounds.vMax[1] - this.bounds.vMin[1], 
            this.bounds.vMax[2] - this.bounds.vMin[2]];
    },

    inFrustum: function() {
        if(!this.bounds) { return true; }
        return Larx.Frustum.inFrustum(this.bounds.vMin, this.bounds.vMax);
    },

    setAttribute: function(attribute, buffer) {
        if(buffer !== undefined && attribute != undefined) {
            Larx.gl.bindBuffer(Larx.gl.ARRAY_BUFFER, buffer);
            Larx.gl.vertexAttribPointer(attribute, buffer.itemSize, Larx.gl.FLOAT, false, 0, 0);
        }
    },
    
    render: function (sp, reflect) {
        if(!this.vertexBuffer || !this.inFrustum()) {
            return;
        }
        
        if(sp.shader.shininess) { Larx.gl.uniform1f(sp.shader.shininess, this.shininess); }
        if(sp.shader.opacity) { Larx.gl.uniform1f(sp.shader.opacity, this.opacity); }
        if(sp.shader.specularWeight) { Larx.gl.uniform1f(sp.shader.specularWeight, this.specularWeight); }
        
        this.setAttribute(sp.shader.vertexPositionAttribute, this.vertexBuffer);
        this.setAttribute(sp.shader.vertexColorAttribute, this.colorBuffer);
        this.setAttribute(sp.shader.vertexNormalAttribute, this.normalBuffer);
        this.setAttribute(sp.shader.textureCoordAttribute, this.texCoordBuffer);

        Larx.gl.bindBuffer(Larx.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        Larx.gl.drawElements(Larx.gl.TRIANGLES, this.indexBuffer.numItems, Larx.gl.UNSIGNED_SHORT, 0);
    }
};
    