/* global vec3 */

var Water = (function () {
    
    function Water() { }
    
    function appendToMesh(mesh, vec, depth) {
        mesh.vertices.push(vec[0]);
        mesh.vertices.push(vec[1]);
        mesh.vertices.push(vec[2]);
        
        mesh.normals.push(0);
        mesh.normals.push(1);
        mesh.normals.push(0);
        
        mesh.depths.push(depth);
    }

    function setIndices(mesh, counter) {
        var start = counter * 6;

        mesh.indices.push(start + 0);
        mesh.indices.push(start + 1);
        mesh.indices.push(start + 2);

        mesh.indices.push(start + 3);
        mesh.indices.push(start + 4);
        mesh.indices.push(start + 5);
    }

    function buildMesh (size, quality, terrain) {
        var rawMesh = {
            vertices: [],
            normals: [],
            indices: [],
            depths: []
        };
        
        var ts = size / quality;
        var t = new Terrain();
        
        var counter = 0;
        for(var z = 0; z < size; z += ts) {
            var vz = z - (size / 2);
                
            for(var x = 0; x < size; x += ts) {
                var vecs = [],
                    depths = [];
                
                var vx = x - (size / 2);
                
                if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                    vecs.push(vec3.fromValues(vx + ts, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz + ts));
                    
                    vecs.push(vec3.fromValues(vx + ts, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz + ts));
                    vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
                    
                    
                    depths.push(t.getElevationAtPoint(terrain, vx + ts, vz));
                    depths.push(t.getElevationAtPoint(terrain, vx, vz));
                    depths.push(t.getElevationAtPoint(terrain, vx, vz + ts));
                    
                    depths.push(t.getElevationAtPoint(terrain, vx + ts, vz));
                    depths.push(t.getElevationAtPoint(terrain, vx, vz + ts));
                    depths.push(t.getElevationAtPoint(terrain, vx + ts, vz + ts));
                } else {
                    vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
                    vecs.push(vec3.fromValues(vx, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz + ts));
                    
                    vecs.push(vec3.fromValues(vx + ts, 0, vz));
                    vecs.push(vec3.fromValues(vx, 0, vz));
                    vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
                    
                    depths.push(t.getElevationAtPoint(terrain, vx + ts, vz + ts));
                    depths.push(t.getElevationAtPoint(terrain, vx, vz));
                    depths.push(t.getElevationAtPoint(terrain, vx, vz + ts));
                    
                    depths.push(t.getElevationAtPoint(terrain, vx + ts, vz));
                    depths.push(t.getElevationAtPoint(terrain, vx, vz));
                    depths.push(t.getElevationAtPoint(terrain, vx + ts, vz + ts));
                }
                
                if(depths[0] > 0 && depths[1] > 0 && depths[2] > 0 && 
                   depths[3] > 0 && depths[4] > 0 && depths[5] > 0) {
                       continue;
                   }
                   
                console.log(depths[0], depths[1], depths[2], depths[3], depths[4], depths[5])
                
                appendToMesh(rawMesh, vecs[0], depths[0]);
                appendToMesh(rawMesh, vecs[1], depths[1]);
                appendToMesh(rawMesh, vecs[2], depths[2]);
                
                appendToMesh(rawMesh, vecs[3], depths[3]);
                appendToMesh(rawMesh, vecs[4], depths[4]);
                appendToMesh(rawMesh, vecs[5], depths[5]);
                
                setIndices(rawMesh, counter, size);
                counter++;
            } 
        }
        
        console.log(rawMesh);
        return rawMesh;
    }
    
    Water.prototype.generate = function (ctx, waterShader, terrain, quality) {
        var deferred = Q.defer();
        var size = terrain.size - 2;
        var rawMesh = buildMesh(size, quality, terrain);
        
        ctx.model.build(rawMesh).then(function(model) {
            model.depths = rawMesh.depths;
            model.shininess = 3.0;
            model.opacity = 0.4;
            model.specularWeight = 1.2;
            waterShader.use();
            
            deferred.resolve({
               model: model,
               size: size,
               waveHeight: 0.25
            });
        });
        
        return deferred.promise;
    };
    
    Water.prototype.update = function (ctx, water, time) {
        var tx = time * 0.001;
        
        for(var i = 0; i < water.model.vertices.length; i += 3) {
            var x = water.model.vertices[i];
            var z = water.model.vertices[i + 2];
            
            water.model.vertices[i + 1] =
                Math.sin(tx + x * 0.6) * Math.cos(tx + z * 0.6) * water.waveHeight;
        }

        ctx.model.calculateNormals(water.model);
        ctx.model.bindBuffers(water.model);
    };
    
    
    Water.prototype.render = function (ctx, waterShader) {
        waterShader.use();
        ctx.matrix.setIdentity();
        ctx.matrix.setUniforms(waterShader);
        ctx.model.render(mWater.model, waterShader);
    }
    
    return Water;
    
})();