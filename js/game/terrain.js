/* global vec2 */
/* global vec3 */
/* global Q */

var Terrain = function(ctx) {
    this.heights;
    this.size;
    this.waterLevel;
    this.model;
    
    this.ctx = ctx;
};

Terrain.prototype._getHeight = function(x, z) {
    if(x < 1 || x >= this.size || z < 1 || z >= this.size) {
        return -4.0;
    }
    
    return this.heights[x][z] - this.waterLevel;
};

Terrain.prototype._appendToModel = function(vec, color) {
    this.model.vertices.push(vec[0]);
    this.model.vertices.push(vec[1]);
    this.model.vertices.push(vec[2]);
    
    var limit = this.size / 2 - 1;
    
    if(vec[0] <= limit && vec[0] >= -limit &&
        vec[2] <= limit && vec[2] >= -limit) {
        this.model.colors.push(color[0]); 
        this.model.colors.push(color[1]); 
        this.model.colors.push(color[2]); 
    } else {
        this.model.colors.push(0.0);
        this.model.colors.push(0.0);
        this.model.colors.push(0.0);
    }
};

Terrain.prototype._setIndices = function(x, z) {
    var start = (z * (this.size - 1) + x) * 6;
    
    this.model.indices.push(start + 0);
    this.model.indices.push(start + 1);
    this.model.indices.push(start + 2);
    
    this.model.indices.push(start + 3);
    this.model.indices.push(start + 4);
    this.model.indices.push(start + 5);
};

Terrain.prototype._build = function() {
    this.size = this.heightmap.size;
    this._setImageHeights();
    
    
    var vecs;
    for(var z = 0; z < this.size + 1; z++) {
        var vz = -(this.size / 2) + z;
            
        for(var x = 0; x < this.size; x++) {
            vecs = [];
            var vx = -(this.size / 2) + x;
            
            if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                vecs.push(vec3.fromValues(vx + 1, this._getHeight(x + 1, z),    vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(x, z),        vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(x, z + 1),    vz + 1));
                
                vecs.push(vec3.fromValues(vx + 1, this._getHeight(x + 1, z),     vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(x, z + 1),     vz + 1));
                vecs.push(vec3.fromValues(vx + 1, this._getHeight(x + 1, z + 1), vz + 1));
            } else {
                vecs.push(vec3.fromValues(vx + 1, this._getHeight(x + 1, z + 1), vz + 1));
                vecs.push(vec3.fromValues(vx,     this._getHeight(x, z),         vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(x, z + 1),     vz + 1));
                
                vecs.push(vec3.fromValues(vx + 1, this._getHeight(x + 1, z),     vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(x, z),         vz));
                vecs.push(vec3.fromValues(vx + 1, this._getHeight(x + 1, z + 1), vz + 1));
            }
            
            var color = this._getColor(x, z);
                
            this._appendToModel(vecs[0], color);
            this._appendToModel(vecs[1], color);
            this._appendToModel(vecs[2], color);
            
            this._appendToModel(vecs[3], color);
            this._appendToModel(vecs[4], color);
            this._appendToModel(vecs[5], color);
            
            this._setIndices(x, z, this.size);
        } 
    }
};

Terrain.prototype._setImageHeights = function() {
    var parsed = [];
    this.heights = new Array(this.size);
    
    for(var i = 0; i < this.heightmap.data.length; i += 4) {
        parsed.push(this.heightmap.data[i]);
    }
    
    for(var x = 0; x < this.size; x++) { 
        this.heights[x] = new Array(this.size); 
    }
    
    for(var z = 0; z < this.size; z++) {
        for(var x = 0; x < this.size; x++) {
            this.heights[x][z] = parsed[z * this.size + x] / 255 * this.elevation;
        }
    }
};
    
Terrain.prototype._getColor = function(x, y) {
    var xy = (y * this.colormap.size + x) * 4;
    return [
        this.colormap.data[xy] / 255,
        this.colormap.data[xy + 1] / 255,
        this.colormap.data[xy + 2] / 255,
        this.colormap.data[xy + 3] / 255];
};
    
Terrain.prototype._getImage = function(url) {    
    var image = new Image();
    var deferred = Q.defer();
    
    image.onload = function () {
        this.size = image.width;
        
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.size);
        canvas.setAttribute('height', this.size);
        
        var canvasCtx = canvas.getContext('2d');
        canvasCtx.drawImage(image, 0, 0);
        
        deferred.resolve({
            size: this.size,
            data: canvasCtx.getImageData(0, 0, this.size, this.size).data
        });
    };
    
    image.src = url;
    
    return deferred.promise;
};
    
Terrain.prototype._baryCentric = function(p1, p2, p3, pos) {
    var det = (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
    var l1 = ((p2[2] - p3[2]) * (pos[0] - p3[0]) + (p3[0] - p2[0]) * (pos[1] - p3[2])) / det;
    var l2 = ((p3[2] - p1[2]) * (pos[0] - p3[0]) + (p1[0] - p3[0]) * (pos[1] - p3[2])) / det;
    var l3 = 1.0 - l1 - l2;
    
    return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
};

Terrain.prototype.generate = function(url, elevation, water) {
    var deferred = Q.defer();   
    var self = this;
    
    self.waterLevel = water;
    
    self._getImage(url + '/heightmap.jpg').then(function (imgHeightmap) {
        self._getImage(url + '/colormap.jpg').then(function (imgColormap) {
            
            self.heightmap = imgHeightmap;
            self.colormap = imgColormap;
            self.elevation = elevation;
            self.model = new Model(self.ctx, 'terrain');
            self.model.colors = [];
            self.model.normals = [];
            
            self._build(); 
            
            self.model.calculateNormals();
            self.model.bindBuffers(); 
            
            deferred.resolve();
        })
        .catch(function (e) { 
            console.error(e); 
            deferred.reject();
        });  
    });
    
    return deferred.promise;
};
    
Terrain.prototype._getPoint = function(x, z) {
    x = x + (this.size / 2);
    z = z + (this.size / 2);
        
    return {
        gx: Math.floor(x),
        gz: Math.floor(z),
        xc: x % 1,
        zc: z % 1
    };
};

Terrain.prototype.getElevationAtPoint = function (x, z) {
    var p = this._getPoint(x, z);      
    var pos = vec2.fromValues(p.xc, p.zc);
    
    var v1, v2, v3;
    if(p.xc <= (1 - p.zc)) {
        v1 = vec3.fromValues(0, this._getHeight(p.gx, p.gz), 0);
        v2 = vec3.fromValues(1, this._getHeight(p.gx + 1, p.gz), 0);
        v3 = vec3.fromValues(0, this._getHeight(p.gx, p.gz + 1), 1);
    } else {
        v1 = vec3.fromValues(1, this._getHeight(p.gx + 1, p.gz), 0);
        v2 = vec3.fromValues(0, this._getHeight(p.gx, p.gz + 1), 1);
        v3 = vec3.fromValues(1, this._getHeight(p.gx + 1, p.gz + 1), 1);
    }

    return this._baryCentric(v1, v2, v3, pos);
};
    
Terrain.prototype.getAngle = function(cx, cz, sx, sz) {
    var rx = sx / 2;
    var rz = sz / 2;
    
    var x1 = this.getElevationAtPoint(cx + rx, cz);
    var x2 = this.getElevationAtPoint(cx - rx, cz);
    
    var z1 = this.getElevationAtPoint(cx, cz + rz);
    var z2 = this.getElevationAtPoint(cx, cz - rz);
    
    var xA = 0, zA = 0;
    
    zA = Math.atan2(x1 - x2, sx);
    xA = Math.atan2(z2 - z1, sz);
    
    return [xA, 0, zA];
};

Terrain.prototype.render = function (shader) {
    this.ctx.matrix.setIdentity();
    this.ctx.matrix.setUniforms(shader);
    this.model.render(shader);
};

    