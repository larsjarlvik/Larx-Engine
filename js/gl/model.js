

var Model = function (ctx, name) {
    this.ctx = ctx;
    this.name = name;
    
    this.vertices = [];
    this.colors;
    this.normals;
    this.indices = [];
    this.shininess = 0;
    this.opacity = 1.0;
    this.specularWeight = 1.0;
    this.faceCount = 0;
    this.vertexCount = 0;
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
    for(var i = 0; i < lines.length; i ++) {
        var line = lines[i].trim();
        
        if(line.indexOf('element vertex') == 0) { this.vertexCount = this._parseHeaderValue(line); }
        if(line.indexOf('element face') == 0) { this.faceCount = this._parseHeaderValue(line); }
        
        if(line === 'end_header') { return i + 1; }
    }
}; 

Model.prototype._parseVertices = function(lines, start) {
    this.vertices = [];
    this.colors = [];
    this.normals = [];

    for(var i = start; i < start + this.vertexCount; i ++) {
        var values = lines[i].trim().split(' ');
        
        this.vertices.push(parseFloat(values[0]));
        this.vertices.push(parseFloat(values[1]));
        this.vertices.push(parseFloat(values[2]));
        
        this.normals.push(parseFloat(values[3]));
        this.normals.push(parseFloat(values[4]));
        this.normals.push(parseFloat(values[5]));
        
        this.colors.push(parseInt(values[6]) / 256);
        this.colors.push(parseInt(values[7]) / 256);
        this.colors.push(parseInt(values[8]) / 256);
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
    return parseInt(n[n.length - 1]);
};

Model.prototype.bindBuffers = function() {
    var gl = this.ctx.gl;
    
    if(!this.vertexBuffer) { this.vertexBuffer = gl.createBuffer(); }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    this.vertexBuffer.itemSize = 3;
    
    if(this.colors) {
        if(!this.colorBuffer) { this.colorBuffer = gl.createBuffer(); }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        this.colorBuffer.itemSize = 3;
    }
    
    if(this.normals) {
        if(!this.normalBuffer) { this.normalBuffer = gl.createBuffer(); }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        this.normalBuffer.itemSize = 3;
    }
    
    if(this.depths) {
        if(!this.waterDepthBuffer) { this.waterDepthBuffer = gl.createBuffer(); }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.waterDepthBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.depths), gl.STATIC_DRAW);
        this.waterDepthBuffer.itemSize = 1;
    }
    
    if(!this.indexBuffer) { this.indexBuffer = gl.createBuffer(); }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    this.indexBuffer.numItems = this.indices.length;
};
    
Model.prototype.load = function () {
    var deferred = Q.defer();
    var self = this;
    
    self._download(self.name).then(function (data) {
        self._parse(data);
        self.bindBuffers();
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

Model.prototype._doRotate = function(angle, a, b) {
    for(var i = 0; i < this.vertices.length; i += 3) {
        var cosTheta = Math.cos(angle);
        var sinTheta = Math.sin(angle);  
        
        var av = cosTheta * (this.vertices[i + a]) - sinTheta*(this.vertices[i + b]);
        var bv = sinTheta * (this.vertices[i + a]) + cosTheta*(this.vertices[i + b]);
        
        var an = cosTheta * (this.normals[i + a]) - sinTheta*(this.normals[i + b]);
        var bn = sinTheta * (this.normals[i + a]) + cosTheta*(this.normals[i + b]);
        
        this.vertices[i + a] = av;
        this.vertices[i + b] = bv;
        this.normals[i + a] = an;
        this.normals[i + b] = bn;
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
    
    for (var i = 0; i < this.vertices.length; i += 9) {
        var a = [this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]];
        var b = [this.vertices[i + 3], this.vertices[i + 4], this.vertices[i + 5]];
        var c = [this.vertices[i + 6], this.vertices[i + 7], this.vertices[i + 8]];
        
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

Model.prototype.getBounds = function() {
    var minX, minY, minZ,
        maxX, maxY, maxZ;
    
    for(var i = 0; i < this.vertices.length; i+=3) {
        if(minX === undefined || this.vertices[i] < minX) { minX = this.vertices[i]; } 
        if(maxX === undefined || this.vertices[i] > maxX) { maxX = this.vertices[i]; }
        
        if(minY === undefined || this.vertices[i + 1] < minY) { minY = this.vertices[i + 1]; } 
        if(maxY === undefined || this.vertices[i + 1] > maxY) { maxY = this.vertices[i + 1]; }
        
        if(minZ === undefined || this.vertices[i + 2] < minZ) { minZ = this.vertices[i + 2]; } 
        if(maxZ === undefined || this.vertices[i + 2] > maxZ) { maxZ = this.vertices[i + 2]; }
    }  
    
    return [minX, maxX, minY, maxY, minZ, maxZ];
};

Model.prototype.getSize = function() {
    var b = this.getBounds();
    return [b[1] - b[0], b[3] - b[2], b[5] - b[4]];
};

Model.prototype.render = function (shaderProgram) {
    var sp = shaderProgram.get();
    var gl = this.ctx.gl;
    
    if(sp.shininess) { gl.uniform1f(sp.shininess, this.shininess); }
    if(sp.opacity) { gl.uniform1f(sp.opacity, this.opacity); }
    if(sp.specularWeight) { gl.uniform1f(sp.specularWeight, this.specularWeight); }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(sp.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    if(this.colorBuffer && sp.vertexColorAttribute) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(sp.vertexColorAttribute, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    } 
    
    if(this.normalBuffer && sp.vertexNormalAttribute) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(sp.vertexNormalAttribute, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    } 
    
    if(this.waterDepthBuffer && sp.vertexWaterDepthAttribute) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.waterDepthBuffer);
        gl.vertexAttribPointer(sp.vertexWaterDepthAttribute, this.waterDepthBuffer.itemSize, gl.FLOAT, false, 0, 0);
    } 
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
};
    