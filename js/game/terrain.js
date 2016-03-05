/* global Model */
/* global vec2 */
/* global vec3 */
/* global Q */

var Terrain = function(ctx, scale) {
    this.heights;
    this.size;
    this.waterLevel;
    
    this.underwater;
    
    this.scale = scale;
    this.ctx = ctx;
    
    this._numBlocks;
    this._blockSize = 4;
    this._blocks = [];
    
    this.flags = { default: 0, reflect: 1, refract: 2 };
};

Terrain.prototype.setLightSettings = function(shininess, specularWeight) {
    for(var i = 0; i < this._blocks.length; i++) {
        this._blocks[i].shininess = shininess;
        this._blocks[i].specularWeight = specularWeight;
    }
};

Terrain.prototype.getSize = function() {
    return this.size * this.scale;
};

Terrain.prototype._getHeight = function(x, z) {
    if(x < 1 || x >= this.size || z < 1 || z >= this.size) {
        return -10.0;
    }
    
    return (this.heights[x][z] - this.waterLevel) * this.scale;
};

Terrain.prototype._append = function(model, vec, color) {
    model.vertices.push(vec[0]);
    model.vertices.push(vec[1]);
    model.vertices.push(vec[2]);
    
    model.colors.push(color[0]); 
    model.colors.push(color[1]); 
    model.colors.push(color[2]); 
};

Terrain.prototype._setIndices = function(model, x, z) {
    var start = (z * (this._blockSize) + x) * 6;
    
    model.indices.push(start + 0);
    model.indices.push(start + 1);
    model.indices.push(start + 2);
    
    model.indices.push(start + 3);
    model.indices.push(start + 4);
    model.indices.push(start + 5);
};

Terrain.prototype._build = function() {
    this.size = this.heightmap.size;
    this._setImageHeights();
    this._numBlocks = this.size / this._blockSize;
    
    for(var x = 0; x < this._numBlocks; x++) {
        for(var z = 0; z < this._numBlocks; z++) {
            var block = this._buildBlock(x * this._blockSize, z * this._blockSize);
            
            block.x = (x * this._blockSize - (this.size / 2)) * this.scale;
            block.z = (z * this._blockSize - (this.size / 2)) * this.scale;
            block.calculateNormals();
            block.setBounds();
            block.bindBuffers(); 
            
            this._blocks.push(block);
        }
    }
}

Terrain.prototype._buildBlock = function(bx, bz) {
    var s = this.scale;
    var model = new Model(this.ctx, 'terrainBlock');
    
    model.colors = [];
    model.normals = [];
    
    for(var z = 0; z < this._blockSize; z++) {
        var vz = z * s;
        
        for(var x = 0; x < this._blockSize; x++) {
            var vecs = [];
            var vx = x * s;
            var tx = bx + x,
                tz = bz + z;
            
            if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                vecs.push(vec3.fromValues(vx + s, this._getHeight(tx + 1, tz),    vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(tx, tz),        vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(tx, tz + 1),    vz + s));
                
                vecs.push(vec3.fromValues(vx + s, this._getHeight(tx + 1, tz),     vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(tx, tz + 1),     vz + s));
                vecs.push(vec3.fromValues(vx + s, this._getHeight(tx + 1, tz + 1), vz + s));
            } else {
                vecs.push(vec3.fromValues(vx + s, this._getHeight(tx + 1, tz + 1), vz + s));
                vecs.push(vec3.fromValues(vx,     this._getHeight(tx, tz),         vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(tx, tz + 1),     vz + s));
                
                vecs.push(vec3.fromValues(vx + s, this._getHeight(tx + 1, tz),     vz));
                vecs.push(vec3.fromValues(vx,     this._getHeight(tx, tz),         vz));
                vecs.push(vec3.fromValues(vx + s, this._getHeight(tx + 1, tz + 1), vz + s));
            }
            
            var color = this._getColor(tx, tz);
            
            this._append(model, vecs[0], color);
            this._append(model, vecs[1], color);
            this._append(model, vecs[2], color);
            
            this._append(model, vecs[3], color);
            this._append(model, vecs[4], color);
            this._append(model, vecs[5], color);
            
            this._setIndices(model, x, z);
        } 
    }
    
    return model;
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
            self._build(); 
            
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
    x = (x + (this.getSize() / 2)) / this.scale;
    z = (z + (this.getSize() / 2)) / this.scale;
        
    return {
        gx: Math.floor(x),
        gz: Math.floor(z),
        xc: x % 1,
        zc: z % 1
    };
};

Terrain.prototype.getElevationAtPoint = function (x, z) {
    var p = this._getPoint(x, z);       
    var v1, v2, v3;
    
    if(p.xc <= (1 - p.zc)) {
        v1 = [0, this._getHeight(p.gx, p.gz), 0];
        v2 = [1, this._getHeight(p.gx + 1, p.gz), 0];
        v3 = [0, this._getHeight(p.gx, p.gz + 1), 1];
    } else {
        v1 = [1, this._getHeight(p.gx + 1, p.gz), 0];
        v2 = [0, this._getHeight(p.gx, p.gz + 1), 1];
        v3 = [1, this._getHeight(p.gx + 1, p.gz + 1), 1];
    }

    return this._baryCentric(v1, v2, v3, vec2.fromValues(p.xc, p.zc));
};
    
Terrain.prototype.getAngle = function(cx, cz, sx, sz) {
    var rx = sx / 2;
    var rz = sz / 2;
    
    return [
        Math.atan2(this.getElevationAtPoint(cx, cz - rz) - this.getElevationAtPoint(cx, cz + rz), sz),
        0,
        Math.atan2(this.getElevationAtPoint(cx + rx, cz) - this.getElevationAtPoint(cx - rx, cz), sx)
    ];
}; 
    


Terrain.prototype.render = function (shader, flag) {   
    for(var i = 0; i < this._blocks.length; i ++) {
        if(flag === this.flags.reflect && this._blocks[i].bounds.vMax[1] < -0.3) { continue; }
        if(flag === this.flags.refract && this._blocks[i].bounds.vMin[1] >  0.3) { continue; }
        
        this._blocks[i].render(shader, [this._blocks[i].x, 0, this._blocks[i].z], flag === this.flags.reflect);
    }  
};