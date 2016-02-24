
var Water = (function () {
    
    function Water() { }
    
    function getNormals(a, b, c) {
        var v1 = vec3.create(), v2 = vec3.create();
        
        vec3.subtract(v1, c, b);
        vec3.subtract(v2, a, b);
        vec3.cross(v1, v1, v2);
        
        vec3.normalize(v1, v1);
        
        return v1;
    }
    
    function appendToMesh(mesh, vec, normals) {
        mesh.vertices.push(vec[0]);
        mesh.vertices.push(vec[1]);
        mesh.vertices.push(vec[2]);
        
        mesh.normals.push(normals[0]);
        mesh.normals.push(normals[1]);
        mesh.normals.push(normals[2]);
    }

    function setIndices(mesh, x, z, size) {
        var start = (z * (size) + x) * 6;

        mesh.indices.push(start + 0);
        mesh.indices.push(start + 1);
        mesh.indices.push(start + 2);

        mesh.indices.push(start + 3);
        mesh.indices.push(start + 4);
        mesh.indices.push(start + 5);
    }

    // TODO: Support detail
    function buildMesh (size, detail) {
        var rawMesh = {
            vertices: [],
            normals: [],
            indices: []   
        };
        
        size = size / detail;
        
        var vecs;
        for(var z = 0; z < size; z++) {
            var vz = (-(size / 2) * detail) + z * detail;
                
            for(var x = 0; x < size; x++) {
                vecs = [];
                var vx = (-(size / 2) * detail) + x * detail;
                
                if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                    vecs.push(vec3.fromValues(vx + detail, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz + detail));
                    
                    vecs.push(vec3.fromValues(vx + detail, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz + detail));
                    vecs.push(vec3.fromValues(vx + detail, 0, vz + detail));
                } else {
                    vecs.push(vec3.fromValues(vx + detail, 0, vz + detail));
                    vecs.push(vec3.fromValues(vx, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz + detail));
                    
                    vecs.push(vec3.fromValues(vx + detail, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz));
                    vecs.push(vec3.fromValues(vx + detail, 0, vz + detail));
                }
                
                var n1 = getNormals(vecs[0], vecs[1], vecs[2]);
                var n2 = getNormals(vecs[3], vecs[4], vecs[5]);
                    
                appendToMesh(rawMesh, vecs[0], n1);
                appendToMesh(rawMesh, vecs[1], n1);
                appendToMesh(rawMesh, vecs[2], n1);
                
                appendToMesh(rawMesh, vecs[3], n2);
                appendToMesh(rawMesh, vecs[4], n2);
                appendToMesh(rawMesh, vecs[5], n2);
                
                setIndices(rawMesh, x, z, size);
            } 
        }
        
        return rawMesh;
    }
    
    Water.prototype.generate = function (waterShader, size, detail) {
        var deferred = Q.defer();
        var rawMesh = buildMesh(size, detail);
        
        gl.model.build(rawMesh).then(function(model) {
            model.shininess = 3.0;
            model.opacity = 0.7;
            model.specularWeight = 1.0;
            
            waterShader.use();
            waterShader.setColor([0.359, 0.781, 0.800]);
            
            console.log(model);
            
            deferred.resolve({
               model: model,
               size: size,
               waveHeight: 0.15,
               detail: detail
            });
        });
        
        return deferred.promise;
    };
    
    Water.prototype.update = function (water, time) {
        var tx = time * 0.002;
        
        for(var i = 0; i < water.model.vertices.length; i += 3) {
            var x = water.model.vertices[i];
            var z = water.model.vertices[i + 2];
            
            water.model.vertices[i + 1] = Math.sin(tx + x) * Math.cos(tx + z) * water.waveHeight;
        }
        

        gl.model.calculateNormals(water.model);
        gl.model.bindBuffers(water.model);
    };
    
    return Water;
    
})();