/* global vec2 */
/* global vec3 */
/* global Q */

var Terrain = (function () {
    
    var heights;
    var size;
    var waterLevel;
    
    function Terrain() { }
    
    function getHeight(x, z) {
        if(x < 1 || x >= size || z < 1 || z >= size) {
            return -10;
        }
        
        return heights[x][z] - waterLevel;
    }
    
    function appendToMesh(mesh, vec, color) {
        mesh.vertices.push(vec[0]);
        mesh.vertices.push(vec[1]);
        mesh.vertices.push(vec[2]);
        
        var limit = size / 2 - 1;
        
        if(vec[0] <= limit && vec[0] >= -limit &&
           vec[2] <= limit && vec[2] >= -limit) {
            mesh.colors.push(color[0]); 
            mesh.colors.push(color[1]); 
            mesh.colors.push(color[2]); 
        } else {
            mesh.colors.push(0.0);
            mesh.colors.push(0.0);
            mesh.colors.push(0.0);
        }
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
    
    function buildMesh (heightmap, colormap, elevation) {
        size = heightmap.size;
        heights = getImageHeights(heightmap, elevation);
        
        var rawMesh = {
            vertices: [],
            normals: [],
            colors: [],
            indices: []   
        };
        
        var vecs;
        for(var z = 0; z < size + 1; z++) {
            var vz = -(size / 2) + z;
                
            for(var x = 0; x < size; x++) {
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
                
                var color = getColor(colormap, x, z);
                    
                appendToMesh(rawMesh, vecs[0], color);
                appendToMesh(rawMesh, vecs[1], color);
                appendToMesh(rawMesh, vecs[2], color);
                
                appendToMesh(rawMesh, vecs[3], color);
                appendToMesh(rawMesh, vecs[4], color);
                appendToMesh(rawMesh, vecs[5], color);
                
                setIndices(rawMesh, x, z, size);
            } 
        }
        
        return rawMesh;
    }
    
    function getImageHeights (heightmap, elevation) {
        var heights = new Array(size);
        var parsed = [];
        
        for(var i = 0; i < heightmap.data.length; i += 4) {
            parsed.push(heightmap.data[i]);
        }
        
        for(var x = 0; x < size; x++) { 
            heights[x] = new Array(size); 
        }
       
        for(var z = 0; z < size; z++) {
            for(var x = 0; x < size; x++) {
                heights[x][z] = parsed[z * size + x] / 255 * elevation;
            }
        }
        
        return heights;
    }
    
    function getColor(colormap, x, y) {
        var xy = (y * colormap.size + x) * 4;
        return [
            colormap.data[xy] / 255,
            colormap.data[xy + 1] / 255,
            colormap.data[xy + 2] / 255,
            colormap.data[xy + 3] / 255];
    }
    
    function getImage(url) {    
        var image = new Image();
        var deferred = Q.defer();
        
        image.onload = function () {
            size = image.width;
            
            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', size);
            canvas.setAttribute('height', size);
            
            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            
            deferred.resolve({
                size: size,
                data: ctx.getImageData(0, 0, size, size).data
            });
        };
        
        image.src = url;
        
        return deferred.promise;
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
        
        waterLevel = water;
        
        getImage(url + '/heightmap.jpg').then(function (imgHeightmap) {
            getImage(url + '/colormap.jpg').then(function (imgColormap) {
                try {
                var rawMesh = buildMesh(imgHeightmap, imgColormap, elevation); 
                
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
                }catch(e) {
                    console.error(e);
                }
            });       
        });
        
        return deferred.promise;
    };
    
    function getPoint(t, x, z) {
        x = x + (t.size / 2);
        z = z + (t.size / 2);
         
        return {
            gx: Math.floor(x),
            gz: Math.floor(z),
            xc: x % 1,
            zc: z % 1
        };
    }
    
    Terrain.prototype.getElevationAtPoint = function (t, x, z) {
        var p = getPoint(t, x, z);      
        var pos = vec2.fromValues(p.xc, p.zc);
        
        var v1, v2, v3;
        if(p.xc <= (1 - p.zc)) {
            v1 = vec3.fromValues(0, getHeight(p.gx, p.gz), 0);
            v2 = vec3.fromValues(1, getHeight(p.gx + 1, p.gz), 0);
            v3 = vec3.fromValues(0, getHeight(p.gx, p.gz + 1), 1);
        } else {
            v1 = vec3.fromValues(1, getHeight(p.gx + 1, p.gz), 0);
            v2 = vec3.fromValues(0, getHeight(p.gx, p.gz + 1), 1);
            v3 = vec3.fromValues(1, getHeight(p.gx + 1, p.gz + 1), 1);
        }
    
        return barryCentric(v1, v2, v3, pos);
    };
    
    Terrain.prototype.getAngle = function(t, cx, cz, sx, sz) {
        var rx = sx / 2;
        var rz = sz / 2;
        
        var x1 = this.getElevationAtPoint(t, cx + rx, cz);
        var x2 = this.getElevationAtPoint(t, cx - rx, cz);
        
        var z1 = this.getElevationAtPoint(t, cx, cz + rz);
        var z2 = this.getElevationAtPoint(t, cx, cz - rz);
        
        var xA = 0, zA = 0;
        
        zA = Math.atan2(x1 - x2, sx);
        xA = Math.atan2(z2 - z1, sz);
        
        return [xA, 0, zA];
    }
    
    return Terrain;
    
})();