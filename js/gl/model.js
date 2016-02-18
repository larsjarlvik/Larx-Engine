var Model = function (gl) {
    this.gl = gl;
}

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
    
    console.log(mesh);
    
    return Q(mesh);
};
    
Model.prototype.parseHeader = function(mesh, lines) {
    for(var i = 0; i < lines.length; i ++) {
        var line = lines[i].trim();
        
        if(line.startsWith('element vertex')) { mesh.vertexCount = this.parseHeaderValue(line); }
        if(line.startsWith('element face')) { mesh.faceCount = this.parseHeaderValue(line); }
        
        if(line === 'end_header') { return i + 1; }
    }
}; 

Model.prototype.parseVertices = function(mesh, lines, start) {
    mesh.vertices = [];
    mesh.colors = [];
    mesh.normals = [];

    for(var i = start; i < start + mesh.vertexCount; i ++) {
        var values = lines[i].trim().split(' ');
        
        mesh.vertices.push(values[0]);
        mesh.vertices.push(values[1]);
        mesh.vertices.push(values[2]);
        
        mesh.normals.push(values[3]);
        mesh.normals.push(values[4]);
        mesh.normals.push(values[5]);
        
        mesh.colors.push(values[6] / 256);
        mesh.colors.push(values[7] / 256);
        mesh.colors.push(values[8] / 256);
    }
};    

Model.prototype.parseFaces = function(mesh, lines, start) {
    mesh.indices = [];

    for(var i = start; i < lines.length; i ++) {
        var values = lines[i].trim().split(' ');
        if(values.length !== 4) { continue; }
        
        mesh.indices.push(values[1]);
        mesh.indices.push(values[2]);
        mesh.indices.push(values[3]);
    }
};

Model.prototype.parseHeaderValue = function(line) {
    var n = line.split(" ");
    return parseInt(n[n.length - 1]);
};

Model.prototype.bindBuffers = function(mesh) {
    mesh.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), this.gl.STATIC_DRAW);
    mesh.vertexBuffer.itemSize = 3;
    
    mesh.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.colors), this.gl.STATIC_DRAW);
    mesh.colorBuffer.itemSize = 3;
    
    mesh.normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.normals), this.gl.STATIC_DRAW);
    mesh.normalBuffer.itemSize = 3;
    
    mesh.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), this.gl.STATIC_DRAW);
    mesh.indexBuffer.numItems = mesh.indices.length;
    
    return Q(mesh);
};
    
Model.prototype.load = function (name) {
    var deferred = Q.defer();
    
    this.download(name)
        .then(this.parse.bind(this))
        .then(this.bindBuffers.bind(this))
        .then(function (mesh) {
            mesh.shininess = 0;
            mesh.opacity = 1.0;
            deferred.resolve(mesh); 
        })
        .catch(function(error) {
            console.error(error); 
            deferred.reject();
        });
    
    return deferred.promise;
};

Model.prototype.rotate = function (mesh, angle) {
    var cosTheta = Math.cos(angle);
    var sinTheta = Math.sin(angle);
        
    for(var i = 0; i < mesh.vertices.length; i += 3) {
        var x = cosTheta * (mesh.vertices[i]) - sinTheta*(mesh.vertices[i + 2]);
        var z = sinTheta * (mesh.vertices[i]) + cosTheta*(mesh.vertices[i + 2]);
        
        mesh.vertices[i] = x;
        mesh.vertices[i + 2] = z;
        
        var nx = cosTheta * (mesh.normals[i]) - sinTheta*(mesh.normals[i + 2]);
        var nz = sinTheta * (mesh.normals[i]) + cosTheta*(mesh.normals[i + 2]);
        
        mesh.normals[i] = nx;
        mesh.normals[i + 2] = nz;
    }
    
    this.bindBuffers(mesh);
};

Model.prototype.clone = function (sourceMesh) {
    return JSON.parse(JSON.stringify(sourceMesh));
};

Model.prototype.render = function (mesh, shaderProgram) {
    this.gl.uniform1f(shaderProgram.shininess, mesh.shininess); 
    this.gl.uniform1f(shaderProgram.opacity, mesh.opacity); 
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vertexBuffer);
    this.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mesh.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.colorBuffer);
    this.gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, mesh.colorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
    this.gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mesh.normalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, mesh.indexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
};
    