/* global vec3 */

var Water = function (ctx) {
    this.ctx = ctx;
    this.model;
    this.size = undefined;
    this.waveHeight = 0.25;
};
    
    
Water.prototype._appendToModel = function(vec, depth) {
    this.model.vertices.push(vec[0]);
    this.model.vertices.push(vec[1]);
    this.model.vertices.push(vec[2]);
    
    this.model.normals.push(0);
    this.model.normals.push(1);
    this.model.normals.push(0);
    
    this.model.depths.push(depth);
};

Water.prototype._setIndices = function(counter) {
    var start = counter * 6;

    this.model.indices.push(start + 0);
    this.model.indices.push(start + 1);
    this.model.indices.push(start + 2);

    this.model.indices.push(start + 3);
    this.model.indices.push(start + 4);
    this.model.indices.push(start + 5);
};

Water.prototype._build = function(terrain) {
    var ts = this.size / this.quality;
    
    var counter = 0;
    for(var z = 0; z < this.size - 0.001; z += ts) {
        var vz = z - (this.size / 2);
            
        for(var x = 0; x < this.size - 0.001; x += ts) {
            var vecs = [],
                depths = [];
            
            var vx = x - (this.size / 2);
            
            if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                vecs.push(vec3.fromValues(vx + ts, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz + ts));
                
                vecs.push(vec3.fromValues(vx + ts, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz + ts));
                vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
                
                depths.push(terrain.getElevationAtPoint(vx + ts, vz));
                depths.push(terrain.getElevationAtPoint(vx, vz));
                depths.push(terrain.getElevationAtPoint(vx, vz + ts));
                
                depths.push(terrain.getElevationAtPoint(vx + ts, vz));
                depths.push(terrain.getElevationAtPoint(vx, vz + ts));
                depths.push(terrain.getElevationAtPoint(vx + ts, vz + ts));
            } else {
                vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
                vecs.push(vec3.fromValues(vx, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz + ts));
                
                vecs.push(vec3.fromValues(vx + ts, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz));
                vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
                
                depths.push(terrain.getElevationAtPoint(vx + ts, vz + ts));
                depths.push(terrain.getElevationAtPoint(vx, vz));
                depths.push(terrain.getElevationAtPoint(vx, vz + ts));
                
                depths.push(terrain.getElevationAtPoint(vx + ts, vz));
                depths.push(terrain.getElevationAtPoint(vx, vz));
                depths.push(terrain.getElevationAtPoint(vx + ts, vz + ts));
            }
            
            if(depths[0] > 0 && depths[1] > 0 && depths[2] > 0 && 
                depths[3] > 0 && depths[4] > 0 && depths[5] > 0) {
                    continue;
                }
                
            this._appendToModel(vecs[0], depths[0]);
            this._appendToModel(vecs[1], depths[1]);
            this._appendToModel(vecs[2], depths[2]);
            
            this._appendToModel(vecs[3], depths[3]);
            this._appendToModel(vecs[4], depths[4]);
            this._appendToModel(vecs[5], depths[5]);
            
            this._setIndices(counter);
            counter++;
        } 
    }
};

Water.prototype.generate = function (terrain, quality) {
    this.quality = quality;
    this.size = terrain.size - 2;
    
    this.model = new Model(this.ctx, 'water');
    this.model.depths = [];
    this.model.shininess = 3.0;
    this.model.opacity = 0.55;
    this.model.specularWeight = 1.2;
    this._build(terrain);
    
    return Q(true);
};
    
Water.prototype.update = function (time) {
    var tx = time * 0.001;
    
    for(var i = 0; i < this.model.vertices.length; i += 3) {
        var x = this.model.vertices[i];
        var z = this.model.vertices[i + 2];
        
        this.model.vertices[i + 1] =
            Math.sin(tx + x * 0.4) * Math.cos(tx + z * 0.6) * this.waveHeight;
    }

    this.model.calculateNormals();
    this.model.bindBuffers();
};


Water.prototype.render = function (shader) {
    this.ctx.matrix.setIdentity();
    this.ctx.matrix.setUniforms(shader);
    this.model.render(shader);
};