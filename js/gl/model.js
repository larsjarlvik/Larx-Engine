

var Model = function (gl) {
    this.gl = gl;
};

Model.prototype.download = function(name) {
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
} 

Model.prototype.parse = function(data) {
    var lines = data.split('\n');
    var mesh = {};
    var bodyStart = this.parseHeader(mesh, lines);
    
    this.parseVertices(mesh, lines, bodyStart);
    this.parseFaces(mesh, lines, bodyStart + mesh.vertexCount);
    
    return Q(mesh);
};
    
Model.prototype.parseHeader = function(mesh, lines) {
    for(var i = 0; i < lines.length; i ++) {
        var line = lines[i].trim();
        
        if(line.indexOf('element vertex') == 0) { mesh.vertexCount = this.parseHeaderValue(line); }
        if(line.indexOf('element face') == 0) { mesh.faceCount = this.parseHeaderValue(line); }
        
        if(line === 'end_header') { return i + 1; }
    }
}; 

Model.prototype.parseVertices = function(mesh, lines, start) {
    mesh.vertices = [];
    mesh.colors = [];
    mesh.normals = [];

    for(var i = start; i < start + mesh.vertexCount; i ++) {
        var values = lines[i].trim().split(' ');
        
        mesh.vertices.push(parseFloat(values[0]));
        mesh.vertices.push(parseFloat(values[1]));
        mesh.vertices.push(parseFloat(values[2]));
        
        mesh.normals.push(parseFloat(values[3]));
        mesh.normals.push(parseFloat(values[4]));
        mesh.normals.push(parseFloat(values[5]));
        
        mesh.colors.push(parseInt(values[6]) / 256);
        mesh.colors.push(parseInt(values[7]) / 256);
        mesh.colors.push(parseInt(values[8]) / 256);
    }
};    

Model.prototype.parseFaces = function(mesh, lines, start) {
    mesh.indices = [];

    for(var i = start; i < lines.length; i ++) {
        var values = lines[i].trim().split(' ');
        if(values.length !== 4) { continue; }
        
        mesh.indices.push(parseInt(values[1]));
        mesh.indices.push(parseInt(values[2]));
        mesh.indices.push(parseInt(values[3]));
    }
};

Model.prototype.parseHeaderValue = function(line) {
    var n = line.split(' ');
    return parseInt(n[n.length - 1]);
};

Model.prototype.bindBuffers = function(mesh) {
    
    if(!mesh.vertexBuffer) { mesh.vertexBuffer = this.gl.createBuffer(); }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), this.gl.STATIC_DRAW);
    mesh.vertexBuffer.itemSize = 3;
    
    if(mesh.colors) {
        if(!mesh.colorBuffer) { mesh.colorBuffer = this.gl.createBuffer(); }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.colors), this.gl.STATIC_DRAW);
        mesh.colorBuffer.itemSize = 3;
    }
    
    if(mesh.normals) {
        if(!mesh.normalBuffer) { mesh.normalBuffer = this.gl.createBuffer(); }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.normals), this.gl.STATIC_DRAW);
        mesh.normalBuffer.itemSize = 3;
    }
    
    if(mesh.depths) {
        if(!mesh.waterDepthBuffer) { mesh.waterDepthBuffer = this.gl.createBuffer(); }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.waterDepthBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.depths), this.gl.STATIC_DRAW);
        mesh.waterDepthBuffer.itemSize = 1;
    }
    
    if(!mesh.indexBuffer) { mesh.indexBuffer = this.gl.createBuffer(); }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), this.gl.STATIC_DRAW);
    mesh.indexBuffer.numItems = mesh.indices.length;
    
    return Q(mesh);
};
    
Model.prototype.load = function (name) {
    var deferred = Q.defer();
    var self = this;
    
    this.download(name)
        .then(this.parse.bind(this))
        .then(function(rawData) {
            return self.bindBuffers(rawData);
        })
        .then(function (mesh) {
            mesh.shininess = 0;
            mesh.opacity = 1.0;
            
            console.log('RESOLVE: ' + name);
            deferred.resolve(mesh); 
        })
        .catch(function(error) {
            console.error(error); 
            deferred.reject();
        })
        .done();
    
    return deferred.promise;
};

Model.prototype.build = function (rawData) {
    var deferred = Q.defer();
    
    this.bindBuffers(rawData)
        .then(function (mesh) {
            mesh.shininess = 0;
            mesh.opacity = 1.0;
            mesh.specularWeight = 1.0;
            
            console.log('RESOLVE: raw');
            deferred.resolve(mesh); 
        })
        .catch(function(error) {
            console.error(error); 
            deferred.reject();
        })
        .done();
    
    return deferred.promise;
};

Model.prototype.create = function () {
    return {
        vertices: [],
        colors: [],
        normals: [],
        indices: [],
        shininess: 0,
        opacity: 1.0,
        specularWeight: 1.0,
        faceCount: 0,
        vertexCount: 0
    };
};


Model.prototype.translate = function (mesh, pos) {    
    for(var i = 0; i < mesh.vertices.length; i += 3) {
        mesh.vertices[i] += pos[0];
        mesh.vertices[i + 1] += pos[1];
        mesh.vertices[i + 2] += pos[2];
    }
};


function rot(mesh, angle, a, b) {
    for(var i = 0; i < mesh.vertices.length; i += 3) {
        var cosTheta = Math.cos(angle);
        var sinTheta = Math.sin(angle);  
        
        var av = cosTheta * (mesh.vertices[i + a]) - sinTheta*(mesh.vertices[i + b]);
        var bv = sinTheta * (mesh.vertices[i + a]) + cosTheta*(mesh.vertices[i + b]);
        
        var an = cosTheta * (mesh.normals[i + a]) - sinTheta*(mesh.normals[i + b]);
        var bn = sinTheta * (mesh.normals[i + a]) + cosTheta*(mesh.normals[i + b]);
        
        mesh.vertices[i + a] = av;
        mesh.vertices[i + b] = bv;
        mesh.normals[i + a] = an;
        mesh.normals[i + b] = bn;
    }
}


Model.prototype.rotate = function (mesh, angle) {
    rot(mesh, angle[0], 1, 2);
    rot(mesh, angle[1], 0, 2);
    rot(mesh, angle[2], 0, 1);
};


Model.prototype.clone = function (sourceMesh) {
    var target = JSON.parse(JSON.stringify(sourceMesh));
    target.vertexBuffer = undefined;
    target.colorBuffer = undefined;
    target.normalBuffer = undefined;
    target.indexBuffer = undefined;
    
    return target;
};

Model.prototype.push = function(targetMesh, sourceMesh) {
    for(var i = 0; i < sourceMesh.indices.length; i++) {
        targetMesh.indices.push(sourceMesh.indices[i] + targetMesh.vertexCount );
    }
    
    Array.prototype.push.apply(targetMesh.colors, sourceMesh.colors);
    Array.prototype.push.apply(targetMesh.normals, sourceMesh.normals);
    Array.prototype.push.apply(targetMesh.vertices, sourceMesh.vertices);
    
    
    targetMesh.faceCount += sourceMesh.faceCount;
    targetMesh.vertexCount += sourceMesh.vertexCount;
}

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
}

Model.prototype.calculateNormals = function (mesh) {
    mesh.normals = Array(mesh.vertices.length);
    
    var v1 = [];
    
    for (var i = 0; i < mesh.vertices.length; i += 9) {
        var a = [mesh.vertices[i], mesh.vertices[i + 1], mesh.vertices[i + 2]];
        var b = [mesh.vertices[i + 3], mesh.vertices[i + 4], mesh.vertices[i + 5]];
        var c = [mesh.vertices[i + 6], mesh.vertices[i + 7], mesh.vertices[i + 8]];
        
        calcNormal(a, b, c, v1);
        mesh.normals[i] = v1[0];
        mesh.normals[i + 1] = v1[1];
        mesh.normals[i + 2] = v1[2];
        mesh.normals[i + 3] = v1[0];
        mesh.normals[i + 4] = v1[1];
        mesh.normals[i + 5] = v1[2];
        mesh.normals[i + 6] = v1[0];
        mesh.normals[i + 7] = v1[1];
        mesh.normals[i + 8] = v1[2];
    }
};

Model.prototype.render = function (mesh, shaderProgram) {
    var sp = shaderProgram.get();
    
    if(sp.shininess) { this.gl.uniform1f(sp.shininess, mesh.shininess); }
    if(sp.opacity) { this.gl.uniform1f(sp.opacity, mesh.opacity); }
    if(sp.specularWeight) { this.gl.uniform1f(sp.specularWeight, mesh.specularWeight); }
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vertexBuffer);
    this.gl.vertexAttribPointer(sp.vertexPositionAttribute, mesh.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

    if(mesh.colorBuffer && sp.vertexColorAttribute) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.colorBuffer);
        this.gl.vertexAttribPointer(sp.vertexColorAttribute, mesh.colorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    } 
    
    if(mesh.normalBuffer && sp.vertexNormalAttribute) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
        this.gl.vertexAttribPointer(sp.vertexNormalAttribute, mesh.normalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    } 
    
    if(mesh.waterDepthBuffer && sp.vertexWaterDepthAttribute) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.waterDepthBuffer);
        this.gl.vertexAttribPointer(sp.vertexWaterDepthAttribute, mesh.waterDepthBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    } 
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, mesh.indexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
    
    
    
};
    