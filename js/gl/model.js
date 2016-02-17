var Model = (function () {
    var _gl, _name, _mesh;
    
    var _vertexBuffer,
        _colorBuffer,
        _normalBuffer,
        _indexBuffer;
    
    function Model(gl, name) {
        _gl = gl;
        _name = name;
    }
    
    function download() {
        var deferred = Q.defer();
        
        var http = new XMLHttpRequest();
        
        http.onreadystatechange = function () {
            if(http.readyState === 4 && http.status === 200) {
                deferred.resolve(http.responseText);
            }
        };
        
        http.open('GET', '/models/' + _name + '.ply?rnd=' + Math.random() * 1000);
        http.send();
        
        return deferred.promise;
    }
    
    function parse(data) {
        var lines = data.split('\n');
        
        _mesh = {};
        
        var bodyStart = parseHeader(lines);
        
        parseVertices(lines, bodyStart);
        parseFaces(lines, bodyStart + _mesh.vertexCount);
        
        console.log(_mesh);
    }
    
    function parseHeader(lines) {
        for(var i = 0; i < lines.length; i ++) {
            var line = lines[i].trim();
            
            if(line.startsWith('element vertex')) { _mesh.vertexCount = parseHeaderValue(line); }
            if(line.startsWith('element face')) { _mesh.faceCount = parseHeaderValue(line); }
            
            if(line === 'end_header') { return i + 1; }
        }
    }
    
    function parseVertices(lines, start) {
        _mesh.vertices = [];
        _mesh.colors = [];
        _mesh.normals = [];
        
        for(var i = start; i < start + _mesh.vertexCount; i ++) {
            var values = lines[i].trim().split(' ');
            
            _mesh.vertices.push(values[0]);
            _mesh.vertices.push(values[1]);
            _mesh.vertices.push(values[2]);
            
            _mesh.normals.push(values[3]);
            _mesh.normals.push(values[4]);
            _mesh.normals.push(values[5]);
            
            _mesh.colors.push(values[6] / 256);
            _mesh.colors.push(values[7] / 256);
            _mesh.colors.push(values[8] / 256);
        }
    }
    
    function parseFaces(lines, start) {
        _mesh.indices = [];
        
        for(var i = start; i < lines.length; i ++) {
            var values = lines[i].trim().split(' ');
            if(values.length !== 4) { continue; }
            
            _mesh.indices.push(values[1]);
            _mesh.indices.push(values[2]);
            _mesh.indices.push(values[3]);
        }
    }
    
    function parseHeaderValue(line) {
        var n = line.split(" ");
        return parseInt(n[n.length - 1]);
    }
    
    function bindBuffers() {
        _vertexBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(_mesh.vertices), _gl.STATIC_DRAW);
        _vertexBuffer.itemSize = 3;
        
        _colorBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _colorBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(_mesh.colors), _gl.STATIC_DRAW);
        _colorBuffer.itemSize = 3;
        
        _normalBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _normalBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(_mesh.normals), _gl.STATIC_DRAW);
        _normalBuffer.itemSize = 3;
        
        _indexBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);
        _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_mesh.indices), _gl.STATIC_DRAW);
        _indexBuffer.numItems = _mesh.indices.length;
    }
    
    Model.prototype.load = function () {
        var deferred = Q.defer();
        
        Q(true)
            .then(download)
            .then(parse)
            .then(bindBuffers)
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
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);
        _gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, _vertexBuffer.itemSize, _gl.FLOAT, false, 0, 0);
       
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _colorBuffer);
        _gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, _colorBuffer.itemSize, _gl.FLOAT, false, 0, 0);
       
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _normalBuffer);
        _gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, _normalBuffer.itemSize, _gl.FLOAT, false, 0, 0);
       
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);
        _gl.drawElements(_gl.TRIANGLES, _indexBuffer.numItems, _gl.UNSIGNED_SHORT, 0);
    };
    
    return Model;
    
})();