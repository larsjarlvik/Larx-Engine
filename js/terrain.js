/* global vec2 */
/* global vec3 */
/* global Q */

var Terrain = (function () {
    
    var heights;
    var size;
    var waterLevel;
    
    function Terrain() { }
    
    function getHeight(x, z) {
        if(x < 0 || x >= size || z < 0 || z >= size) {
            return 0;
        }
        
        return heights[x][z] - waterLevel;
    }
    
    function appendToMesh(mesh, vec) {
        mesh.vertices.push(vec[0]);
        mesh.vertices.push(vec[1]);
        mesh.vertices.push(vec[2]);
        
        mesh.colors.push(0.468);
        mesh.colors.push(0.621);
        mesh.colors.push(0.226);
    }
    
    function setIndices(mesh, x, z) {
        var start = (z * (size -1) + x) * 6;
        
        mesh.indices.push(start + 0);
        mesh.indices.push(start + 1);
        mesh.indices.push(start + 2);
        
        mesh.indices.push(start + 3);
        mesh.indices.push(start + 4);
        mesh.indices.push(start + 5);
    }
    
    function buildMesh (image, elevation) {
        size = image.width;
        heights = getImageHeights(image, elevation);
        
        var rawMesh = {
            vertices: [],
            normals: [],
            colors: [],
            indices: []   
        };
        
        var vecs;
        for(var z = 0; z < size - 1; z++) {
            var vz = -(size / 2) + z;
                
            for(var x = 0; x < size - 1; x++) {
                vecs = [];
                var vx = -(size / 2) + x;
                
                if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                    vecs.push(vec3.fromValues(vx + 1, getHeight(x + 1, z),    vz));
                    vecs.push(vec3.fromValues(vx,     getHeight(x, z),        vz));
                    vecs.push(vec3.fromValues(vx,     getHeight(x, z + 1),    vz + 1));
                    
                    vecs.push(vec3.fromValues(vx + 1, getHeight(x + 1, z),     vz));
                    vecs.push(vec3.fromValues(vx,     getHeight(x, z + 1),     vz + 1));
                    vecs.push(vec3.fromValues(vx + 1, getHeight(x + 1, z + 1), vz + 1));
                } else {
                    vecs.push(vec3.fromValues(vx + 1, getHeight(x + 1, z + 1), vz + 1));
                    vecs.push(vec3.fromValues(vx,     getHeight(x, z),         vz));
                    vecs.push(vec3.fromValues(vx,     getHeight(x, z + 1),     vz + 1));
                    
                    vecs.push(vec3.fromValues(vx + 1, getHeight(x + 1, z),     vz));
                    vecs.push(vec3.fromValues(vx,     getHeight(x, z),         vz));
                    vecs.push(vec3.fromValues(vx + 1, getHeight(x + 1, z + 1), vz + 1));
                }
                    
                appendToMesh(rawMesh, vecs[0]);
                appendToMesh(rawMesh, vecs[1]);
                appendToMesh(rawMesh, vecs[2]);
                
                appendToMesh(rawMesh, vecs[3]);
                appendToMesh(rawMesh, vecs[4]);
                appendToMesh(rawMesh, vecs[5]);
                
                setIndices(rawMesh, x, z, size);
            } 
        }
        
        return rawMesh;
    }
    
    function getImageHeights (image, elevation) {
        var canvas = document.createElement('canvas');
        
        canvas.setAttribute('width', size);
        canvas.setAttribute('height', size);
        
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
       
        var pixels = ctx.getImageData(0, 0, size, size).data;
        var parsed = [];
        
        for(var i = 0; i < pixels.length; i += 4) {
            parsed.push(pixels[i]);
        }
       
        var heights = new Array(size);
        for(var z = 0; z < size; z++) { 
            heights[z] = new Array(size); 
        }
       
        for(var z = 0; z < size; z++) {
            for(var x = 0; x < size; x++) {
                heights[x][z] = parsed[z * size + x] / 255 * elevation;
            }
        }
            
        return heights;
    }
    
    function  barryCentric(p1, p2, p3, pos) {
		var det = (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
		var l1 = ((p2[2] - p3[2]) * (pos[0] - p3[0]) + (p3[0] - p2[0]) * (pos[1] - p3[2])) / det;
		var l2 = ((p3[2] - p1[2]) * (pos[0] - p3[0]) + (p1[0] - p3[0]) * (pos[1] - p3[2])) / det;
		var l3 = 1.0 - l1 - l2;
        
		return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
	}

    
    Terrain.prototype.generatefromImage = function(gl, url, elevation, water) {
        var deferred = Q.defer();       
        var image = new Image();
        
        waterLevel = water;
        
        image.onload = function () {
            var rawMesh = buildMesh(image, elevation); 
            
            gl.model.build(rawMesh).then(function(model) {
                gl.model.calculateNormals(model);
                gl.model.bindBuffers(model);
                
                deferred.resolve({
                    model: model,
                    size: size,
                    heights: heights,
                    waterLevel: waterLevel
                }); 
            });          
        };
        
        image.src = url;
        return deferred.promise;
    };
    
    Terrain.prototype.getElevationAtPoint = function (t, x, z) {      
        x = x + (t.size / 2);
        z = z + (t.size / 2);
         
        var gridX = Math.floor(x);
        var gridZ = Math.floor(z);
        
        var xCoord = x % 1;
        var zCoord = z % 1;
        var pos = vec2.fromValues(xCoord, zCoord);
        
        var v1, v2, v3;
        if(xCoord <= (1 - zCoord)) {
            v1 = vec3.fromValues(0, getHeight(gridX, gridZ), 0);
            v2 = vec3.fromValues(1, getHeight(gridX + 1, gridZ), 0);
            v3 = vec3.fromValues(0, getHeight(gridX, gridZ + 1), 1);
        } else {
            v1 = vec3.fromValues(1, getHeight(gridX + 1, gridZ), 0);
            v2 = vec3.fromValues(0, getHeight(gridX, gridZ + 1), 1);
            v3 = vec3.fromValues(1, getHeight(gridX + 1, gridZ + 1), 1);
        }
    
        return barryCentric(v1, v2, v3, pos);
    };
    
    return Terrain;
    
})();