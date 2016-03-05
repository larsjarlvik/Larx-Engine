

var Model = function (ctx, name) {
    this.ctx = ctx;
    this.name = name;
    
    this.properties = [];
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

Model.prototype.setBounds = function() {
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
};


Model.prototype._download = function() {
    var deferred = Q.defer();
    var http = new XMLHttpRequest();
    
    http.onreadystatechange = function () {
        if(http.readyState === 4 && http.status === 200) {
            deferred.resolve(http.responseText);
        }
    };
    
    http.open('GET', '/models/' + this.name + '.ply?rnd=' + Math.random() * 1000);
    http.send();
    
    return deferred.promise;
} 

Model.prototype._parse = function(data) {
    var lines = data.split('\n');
    var bodyStart = this._parseHeader(lines);
    
    this._parseVertices(lines, bodyStart);
    this._parseFaces(lines, bodyStart + this.vertexCount);
};
    
Model.prototype._parseHeader = function(lines) {
    this.properties = [];
    var propertyIndex = 0;
    
    for(var i = 0; i < lines.length; i ++) {
        var line = lines[i].trim();
        
        if(line.indexOf('property') == 0) {
            var headerValue = this._parseHeaderValue(line);
            
            switch(headerValue) {
                case 'x':
                    this.properties['vertices'] = propertyIndex;
                    break;
                case 'nx':
                    this.properties['normals'] = propertyIndex;
                    break;
                case 's':
                    this.properties['texCoords'] = propertyIndex;
                    break;
                case 'red':
                    this.properties['colors'] = propertyIndex;
                    break;
            }
            propertyIndex ++;
        }
            
        
        if(line.indexOf('element vertex') == 0) { this.vertexCount = parseInt(this._parseHeaderValue(line)); }
        if(line.indexOf('element face') == 0) { this.faceCount = parseInt(this._parseHeaderValue(line)); }
        
        if(line === 'end_header') { return i + 1; }
    }
}; 

Model.prototype._parseVertices = function(lines, start) {
    if(this.properties['vertices'] !== undefined) { this.vertices = []; }
    if(this.properties['normals'] !== undefined) { this.normals = []; }
    if(this.properties['colors'] !== undefined) { this.colors = []; }
    if(this.properties['texCoords'] !== undefined) { this.texCoords = []; }
    
    for(var i = start; i < start + this.vertexCount; i ++) {
        var values = lines[i].trim().split(' ');
        
        if(this.properties['vertices'] !== undefined) {
            this.vertices.push(parseFloat(values[this.properties['vertices']]));
            this.vertices.push(parseFloat(values[this.properties['vertices'] + 1]));
            this.vertices.push(parseFloat(values[this.properties['vertices'] + 2]));
        }
        
        if(this.properties['normals'] !== undefined) {
            this.normals.push(parseFloat(values[this.properties['normals']]));
            this.normals.push(parseFloat(values[this.properties['normals'] + 1]));
            this.normals.push(parseFloat(values[this.properties['normals'] + 2]));
        }
        
        if(this.properties['texCoords'] !== undefined) {
            this.texCoords.push(parseFloat(values[this.properties['texCoords']]));
            this.texCoords.push(parseFloat(values[this.properties['texCoords'] + 1]));
        }
        
        if(this.properties['colors'] !== undefined) {
            this.colors.push(parseFloat(values[this.properties['colors']]) / 256.0);
            this.colors.push(parseFloat(values[this.properties['colors'] + 1]) / 256.0);
            this.colors.push(parseFloat(values[this.properties['colors'] + 2]) / 256.0);
        }
    }
};    

Model.prototype._parseFaces = function(lines, start) {
    this.indices = [];

    for(var i = start; i < lines.length; i ++) {
        var values = lines[i].trim().split(' ');
        if(values.length !== 4) { continue; }
        
        this.indices.push(parseInt(values[1]));
        this.indices.push(parseInt(values[2]));
        this.indices.push(parseInt(values[3]));
    }
};

Model.prototype._parseHeaderValue = function(line) {
    var n = line.split(' ');
    return n[n.length - 1];
};


Model.prototype._bindBuffer = function(buffer, data, itemSize) {
    if(!data) { return; }
    if(!buffer) { buffer = this.ctx.gl.createBuffer();  }
    
    this.ctx.gl.bindBuffer(this.ctx.gl.ARRAY_BUFFER, buffer);
    this.ctx.gl.bufferData(this.ctx.gl.ARRAY_BUFFER, new Float32Array(data), this.ctx.gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    
    return buffer;
};

Model.prototype.bindBuffers = function() {
    this.vertexBuffer = this._bindBuffer(this.vertexBuffer, this.vertices, 3);
    
    this.colorBuffer = this._bindBuffer(this.colorBuffer, this.colors, 3);
    this.normalBuffer = this._bindBuffer(this.normalBuffer, this.normals, 3);
    this.texCoordBuffer = this._bindBuffer(this.texCoordBuffer, this.texCoords, 2);
    
    if(!this.indexBuffer) { this.indexBuffer = this.ctx.gl.createBuffer(); }
    this.ctx.gl.bindBuffer(this.ctx.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.ctx.gl.bufferData(this.ctx.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.ctx.gl.STATIC_DRAW);
    this.indexBuffer.numItems = this.indices.length;
};
    
Model.prototype.load = function () {
    var deferred = Q.defer();
    var self = this;
    
    self._download(self.name).then(function (data) {
        self._parse(data);
        self.bindBuffers();
        self.setBounds();
        deferred.resolve(); 
    })
    .catch(function(e) {
        console.error(e); 
        deferred.reject();
    });

    return deferred.promise;
};

Model.prototype.translate = function (pos) {    
    for(var i = 0; i < this.vertices.length; i += 3) {
        this.vertices[i] += pos[0];
        this.vertices[i + 1] += pos[1];
        this.vertices[i + 2] += pos[2];
    }
};

Model.prototype.scale = function (value) {    
    for(var i = 0; i < this.vertices.length; i += 3) {
        this.vertices[i] *= value;
        this.vertices[i + 1] *= value;
        this.vertices[i + 2] *= value;
    }
};


Model.prototype._doRotate = function(angle, a, b) {
    var cosTheta = Math.cos(angle);
    var sinTheta = Math.sin(angle);
     
    for(var i = 0; i < this.vertices.length; i += 3) { 
        var av = cosTheta * (this.vertices[i + a]) - sinTheta*(this.vertices[i + b]);
        var bv = sinTheta * (this.vertices[i + a]) + cosTheta*(this.vertices[i + b]);
        
        this.vertices[i + a] = av;
        this.vertices[i + b] = bv;
        
        if(this.normals) {
            var an = cosTheta * (this.normals[i + a]) - sinTheta*(this.normals[i + b]);
            var bn = sinTheta * (this.normals[i + a]) + cosTheta*(this.normals[i + b]);
            
            this.normals[i + a] = an;
            this.normals[i + b] = bn;
        }
    }
}

Model.prototype.rotate = function (angle) {
    this._doRotate(angle[0], 1, 2);
    this._doRotate(angle[1], 0, 2);
    this._doRotate(angle[2], 0, 1);
};

Model.prototype.clone = function () {
    var target = new Model(this.ctx, this.name);
    
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
};

Model.prototype.push = function(source) {
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
};

Model.prototype._calcNormal = function(a, b, c, out) {
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
};

Model.prototype.calculateNormals = function () {
    this.normals = Array(this.vertices.length);
    
    var v1 = [];
    var a, b, c;
    
    for (var i = 0; i < this.vertices.length; i += 9) {
        a = [this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]];
        b = [this.vertices[i + 3], this.vertices[i + 4], this.vertices[i + 5]];
        c = [this.vertices[i + 6], this.vertices[i + 7], this.vertices[i + 8]];
        
        this._calcNormal(a, b, c, v1);
        this.normals[i] = v1[0];
        this.normals[i + 1] = v1[1];
        this.normals[i + 2] = v1[2];
        this.normals[i + 3] = v1[0];
        this.normals[i + 4] = v1[1];
        this.normals[i + 5] = v1[2];
        this.normals[i + 6] = v1[0];
        this.normals[i + 7] = v1[1];
        this.normals[i + 8] = v1[2];
    }
};

Model.prototype.getSize = function() {
    return [
        this.bounds.vMax[0] - this.bounds.vMin[0], 
        this.bounds.vMax[1] - this.bounds.vMin[1], 
        this.bounds.vMax[2] - this.bounds.vMin[2]];
};

Model.prototype.inFrustum = function(translation) {
    if(!this.bounds) { return true; }
    
    return this.ctx.frustum.inFrustum([
        this.bounds.vMin[0] + translation[0],
        this.bounds.vMin[1] + translation[1],
        this.bounds.vMin[2] + translation[2]
    ],[
        this.bounds.vMax[0] + translation[0],
        this.bounds.vMax[1] + translation[1],
        this.bounds.vMax[2] + translation[2]
    ]);
};

Model.prototype._setAttribute = function(attribute, buffer) {
    if(buffer !== undefined && attribute != undefined) {
        this.ctx.gl.bindBuffer(this.ctx.gl.ARRAY_BUFFER, buffer);
        this.ctx.gl.vertexAttribPointer(attribute, buffer.itemSize, this.ctx.gl.FLOAT, false, 0, 0);
    }
}


Model.prototype.render = function (shaderProgram, translation, reflect) {
    if(!this.vertexBuffer || !this.inFrustum(translation)) {
        return;
    }
    
    this._sp = shaderProgram.get();
    this.ctx.matrix.setIdentity(reflect);
    this.ctx.matrix.translate(translation);
    this.ctx.matrix.setUniforms(shaderProgram);
    
    if(this._sp.shininess) { this.ctx.gl.uniform1f(this._sp.shininess, this.shininess); }
    if(this._sp.opacity) { this.ctx.gl.uniform1f(this._sp.opacity, this.opacity); }
    if(this._sp.specularWeight) { this.ctx.gl.uniform1f(this._sp.specularWeight, this.specularWeight); }
    
    this._setAttribute(this._sp.vertexPositionAttribute, this.vertexBuffer);
    this._setAttribute(this._sp.vertexColorAttribute, this.colorBuffer);
    this._setAttribute(this._sp.vertexNormalAttribute, this.normalBuffer);
    this._setAttribute(this._sp.textureCoordAttribute, this.texCoordBuffer);

    this.ctx.gl.bindBuffer(this.ctx.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.ctx.gl.drawElements(this.ctx.gl.TRIANGLES, this.indexBuffer.numItems, this.ctx.gl.UNSIGNED_SHORT, 0);
};
    