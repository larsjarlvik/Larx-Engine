
Larx.Terrain = function(scale) {
    this.heights;
    this.size;
    this.waterLevel;
    
    this.underwater;
    this.scale = scale;
    
    this.numBlocks;
    this.blockSize = 12;
    this.blocks = [];
    
    this.reflect = { NO: 0, YES: 1 };
    this.clip = { NONE: 0, TOP: 1, BOTTOM: 2 };
};


Larx.Terrain.prototype = {
    setLightSettings: function(shininess, specularWeight) {
        for(var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].shininess = shininess;
            this.blocks[i].specularWeight = specularWeight;
        }
    },

    getSize: function() {
        return this.size * this.scale;
    },
    
    build: function() {
        var self = this;
         
        function buildBlock(bx, bz) {
            var s = self.scale;
            var model = new Larx.Model();
            
            var mx = (bx * self.blockSize - (self.size / 2)) * self.scale;
            var mz = (bz * self.blockSize - (self.size / 2)) * self.scale;
            
            function append(model, vec, color) {
                model.vertices.push(mx + vec[0]);
                model.vertices.push(vec[1]);
                model.vertices.push(mz + vec[2]);
                
                model.colors.push(color[0]); 
                model.colors.push(color[1]); 
                model.colors.push(color[2]); 
                
                model.normals.push(0); 
                model.normals.push(1); 
                model.normals.push(0); 
            }
            
            function setIndices(model, x, z) {
                var start = (z * (self.blockSize) + x) * 6;
                
                model.indices.push(start + 0);
                model.indices.push(start + 1);
                model.indices.push(start + 2);
                
                model.indices.push(start + 3);
                model.indices.push(start + 4);
                model.indices.push(start + 5);
            }
            
    
            function getColor(x, y) {    
                if(x >= self.size) { x = self.size - 1; }
                if(y >= self.size) { y = self.size - 1; }
                
                var xy = (y * self.colormap.size + x) * 4;
                return [
                    self.colormap.data[xy] / 255,
                    self.colormap.data[xy + 1] / 255,
                    self.colormap.data[xy + 2] / 255,
                    self.colormap.data[xy + 3] / 255];
            }
            
            model.colors = [];
            model.normals = [];
            
            for(var z = 0; z < self.blockSize; z++) {
                var vz = z * s;
                
                for(var x = 0; x < self.blockSize; x++) {
                    var vecs = [], colors = [];
                    var vx = x * s;
                    var tx = bx * self.blockSize + x,
                        tz = bz * self.blockSize + z;
                    
                    if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                        vecs.push([vx + s, self.getHeight(tx + 1, tz),    vz]);
                        vecs.push([vx,     self.getHeight(tx, tz),        vz]);
                        vecs.push([vx,     self.getHeight(tx, tz + 1),    vz + s]);
                        
                        colors.push(getColor(tx + 1, tz));
                        colors.push(getColor(tx, tz));
                        colors.push(getColor(tx, tz + 1));
                        
                        vecs.push([vx + s, self.getHeight(tx + 1, tz),     vz]);
                        vecs.push([vx,     self.getHeight(tx, tz + 1),     vz + s]);
                        vecs.push([vx + s, self.getHeight(tx + 1, tz + 1), vz + s]);
                        
                        colors.push(getColor(tx + 1, tz));
                        colors.push(getColor(tx, tz + 1));
                        colors.push(getColor(tx + 1, tz + 1));
                    } else {
                        vecs.push([vx + s, self.getHeight(tx + 1, tz + 1), vz + s]);
                        vecs.push([vx,     self.getHeight(tx, tz),         vz]);
                        vecs.push([vx,     self.getHeight(tx, tz + 1),     vz + s]);
                        
                        colors.push(getColor(tx + 1, tz + 1));
                        colors.push(getColor(tx, tz));
                        colors.push(getColor(tx, tz + 1));
                        
                        vecs.push([vx + s, self.getHeight(tx + 1, tz),     vz]);
                        vecs.push([vx,     self.getHeight(tx, tz),         vz]);
                        vecs.push([vx + s, self.getHeight(tx + 1, tz + 1), vz + s]);
                        
                        colors.push(getColor(tx + 1, tz));
                        colors.push(getColor(tx, tz));
                        colors.push(getColor(tx + 1, tz + 1));
                    }
                    
                    
                    append(model, vecs[0], colors[0]);
                    append(model, vecs[1], colors[1]);
                    append(model, vecs[2], colors[2]);
                    
                    append(model, vecs[3], colors[3]);
                    append(model, vecs[4], colors[4]);
                    append(model, vecs[5], colors[5]);
                    
                    setIndices(model, x, z);
                } 
            }
            
            return model;
        }
        
        function setImageHeights() {
            var parsed = [];
            self.heights = new Array(self.size);
            
            for(var i = 0; i < self.heightmap.data.length; i += 4) {
                parsed.push(self.heightmap.data[i]);
            }
            
            for(var x = 0; x < self.size; x++) { 
                self.heights[x] = new Array(self.size); 
            }
            
            for(var z = 0; z < self.size; z++) {
                for(var x = 0; x < self.size; x++) {
                    self.heights[x][z] = parsed[z * self.size + x] / 255 * self.elevation;
                }
            }
        }
        
        this.size = this.heightmap.size;
        this.numBlocks = this.size / this.blockSize;
        setImageHeights();
        
        for(var x = 0; x < this.numBlocks; x++) {
            for(var z = 0; z < this.numBlocks; z++) {
                var block = buildBlock(x, z);
                
                block.calculateNormals();
                block.setBounds();
                block.bindBuffers(); 
                
                this.blocks.push(block);
            }
        }
    },
    
    generate: function(url, elevation, water) {
        var deferred = Q.defer();   
        var self = this;
        
        self.waterLevel = water;
        
        self.getImage(url + '/heightmap.jpg').then(function (imgHeightmap) {
            self.getImage(url + '/colormap.jpg').then(function (imgColormap) {
                
                self.heightmap = imgHeightmap;
                self.colormap = imgColormap;
                self.elevation = elevation;
                self.build(); 
                
                deferred.resolve();
            })
            .catch(function (e) { 
                console.error(e); 
                deferred.reject();
            });  
        });
        
        return deferred.promise;
    },
    
    getElevationAtPoint: function (x, z) {
        var p = this.getPoint(x, z);       
        var v1, v2, v3;
        
        if(p.xc <= (1 - p.zc)) {
            v1 = [0, this.getHeight(p.gx, p.gz), 0];
            v2 = [1, this.getHeight(p.gx + 1, p.gz), 0];
            v3 = [0, this.getHeight(p.gx, p.gz + 1), 1];
        } else {
            v1 = [1, this.getHeight(p.gx + 1, p.gz), 0];
            v2 = [0, this.getHeight(p.gx, p.gz + 1), 1];
            v3 = [1, this.getHeight(p.gx + 1, p.gz + 1), 1];
        }

        return this.baryCentric(v1, v2, v3, [p.xc, p.zc]);
    },
    
    getAngle: function(cx, cz, sx, sz) {
        var rx = sx / 2;
        var rz = sz / 2;
        
        return [
            Math.atan2(this.getElevationAtPoint(cx, cz - rz) - this.getElevationAtPoint(cx, cz + rz), sz),
            0,
            Math.atan2(this.getElevationAtPoint(cx + rx, cz) - this.getElevationAtPoint(cx - rx, cz), sx)
        ];
    },
    
    getHeight: function(x, z) {
        if(x < 1 || x >= this.size || z < 1 || z >= this.size) {
            return -10.0;
        }
        
        return (this.heights[x][z] - this.waterLevel) * this.scale;
    },
    
    getImage: function(url) {  
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
    },
    
    baryCentric: function(p1, p2, p3, pos) {
        var det = (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
        var l1 = ((p2[2] - p3[2]) * (pos[0] - p3[0]) + (p3[0] - p2[0]) * (pos[1] - p3[2])) / det;
        var l2 = ((p3[2] - p1[2]) * (pos[0] - p3[0]) + (p1[0] - p3[0]) * (pos[1] - p3[2])) / det;
        var l3 = 1.0 - l1 - l2;
        
        return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
    },
    
    getPoint: function(x, z) {
        x = (x + (this.getSize() / 2)) / this.scale;
        z = (z + (this.getSize() / 2)) / this.scale;
            
        return {
            gx: Math.floor(x),
            gz: Math.floor(z),
            xc: x % 1,
            zc: z % 1
        };
    },
    
    render: function (shader, clip, reflect) {   
        for(var i = 0; i < this.blocks.length; i ++) {
            if(clip === this.clip.BOTTOM && this.blocks[i].bounds.vMax[1] < -0.3) { continue; }
            if(clip === this.clip.TOP && this.blocks[i].bounds.vMin[1] >  0.3) { continue; }
            
            this.blocks[i].render(shader, reflect === this.reflect.YES);
        }
    }
};