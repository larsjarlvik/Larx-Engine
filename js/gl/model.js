var Model = function (gl, name) {
    this.gl = gl;
    this.name = name;
    
    this.mesh;
    this.vertexBuffer;
    this.colorBuffer;
    this.normalBuffer;
    this.indexBuffer;
}

Model.prototype.download = function() {
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

Model.prototype.parse = function(data) {
    var lines = data.split('\n');
    
    this.mesh = {};
    
    var bodyStart = this.parseHeader(lines);
    
    this.parseVertices(lines, bodyStart);
    this.parseFaces(lines, bodyStart + this.mesh.vertexCount);
    
    console.log(this.mesh);
};
    
Model.prototype.parseHeader = function(lines) {
    for(var i = 0; i < lines.length; i ++) {
        var line = lines[i].trim();
        
        if(line.startsWith('element vertex')) { this.mesh.vertexCount = this.parseHeaderValue(line); }
        if(line.startsWith('element face')) { this.mesh.faceCount = this.parseHeaderValue(line); }
        
        if(line === 'end_header') { return i + 1; }
    }
}; 

Model.prototype.parseVertices = function(lines, start) {
    this.mesh.vertices = [];
    this.mesh.colors = [];
    this.mesh.normals = [];

    for(var i = start; i < start + this.mesh.vertexCount; i ++) {
        var values = lines[i].trim().split(' ');
        
        this.mesh.vertices.push(values[0]);
        this.mesh.vertices.push(values[1]);
        this.mesh.vertices.push(values[2]);
        
        this.mesh.normals.push(values[3]);
        this.mesh.normals.push(values[4]);
        this.mesh.normals.push(values[5]);
        
        this.mesh.colors.push(values[6] / 256);
        this.mesh.colors.push(values[7] / 256);
        this.mesh.colors.push(values[8] / 256);
    }
};    

Model.prototype.parseFaces = function(lines, start) {
    this.mesh.indices = [];

    for(var i = start; i < lines.length; i ++) {
        var values = lines[i].trim().split(' ');
        if(values.length !== 4) { continue; }
        
        this.mesh.indices.push(values[1]);
        this.mesh.indices.push(values[2]);
        this.mesh.indices.push(values[3]);
    }
};

Model.prototype.parseHeaderValue = function(line) {
    var n = line.split(" ");
    return parseInt(n[n.length - 1]);
};

Model.prototype.bindBuffers = function() {
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertices), this.gl.STATIC_DRAW);
    this.vertexBuffer.itemSize = 3;
    
    this.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.colors), this.gl.STATIC_DRAW);
    this.colorBuffer.itemSize = 3;
    
    this.normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.normals), this.gl.STATIC_DRAW);
    this.normalBuffer.itemSize = 3;
    
    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.mesh.indices), this.gl.STATIC_DRAW);
    this.indexBuffer.numItems = this.mesh.indices.length;
};
    
Model.prototype.load = function () {
    var deferred = Q.defer();
    
    this.vertexBuffer = 'test';
    
    Q(true)
        .then(this.download.bind(this))
        .then(this.parse.bind(this))
        .then(this.bindBuffers.bind(this))
        .then(function () {
            deferred.resolve(); 
        })
        .catch(function(error) {
            console.error(error); 
            deferred.reject();
        });
    
    return deferred.promise;
};
    
Model.prototype.set = function (mesh) {
    var deferred = Q.defer();
    
    this.mesh = mesh;
    
    Q(true)
        .then(this.bindBuffers.bind(this))
        .then(function () {
            deferred.resolve(); 
        })
        .catch(function(error) {
            console.error(error); 
            deferred.reject();
        });
    
    return deferred.promise;
};

Model.prototype.render = function (shaderProgram) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.colorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.normalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, this.indexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
};
    