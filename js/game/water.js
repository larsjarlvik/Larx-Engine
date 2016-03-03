/* global vec3 */

var Water = function (ctx, gameLoop) {
    this.ctx = ctx;
    this.gameLoop = gameLoop;
    this.model;
    this.size = undefined;
    this.waveHeight = 0.25;
    this.speed = 0.5;
    this.frames = [];
    this.waveIntensity = 0.5;
    this.currentFrame = 0;
    this.refraction;
    this.reflection;
};
    
    
Water.prototype._appendToModel = function(vec) {
    this.model.vertices.push(vec[0]);
    this.model.vertices.push(vec[1]);
    this.model.vertices.push(vec[2]);
    
    this.model.normals.push(0);
    this.model.normals.push(1);
    this.model.normals.push(0);
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
    var ts = (this.size / this.quality);
    
    var counter = 0;
    
    for(var z = 0; z < this.size - 0.001; z += ts) {
        var vz = z - (this.size / 2);
            
        for(var x = 0; x < this.size - 0.001; x += ts) {
            var vecs = [];
            var vx = x - (this.size / 2);
            
            if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                vecs.push(vec3.fromValues(vx + ts, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz + ts));
                
                vecs.push(vec3.fromValues(vx + ts, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz + ts));
                vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
            } else {
                vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
                vecs.push(vec3.fromValues(vx, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz + ts));
                
                vecs.push(vec3.fromValues(vx + ts, 0, vz));
                vecs.push(vec3.fromValues(vx, 0, vz));
                vecs.push(vec3.fromValues(vx + ts, 0, vz + ts));
            }
            
            var add = false;
            for(var i = 0; i < vecs.length; i++) {
                var elev = terrain.getElevationAtPoint(vecs[i][0], vecs[i][2]);
                if(elev <= this.waveHeight) {
                    add = true;
                    break;
                }
            }
            
            if(!add) {
                continue;
            }
            
            this._appendToModel(vecs[0]);
            this._appendToModel(vecs[1]);
            this._appendToModel(vecs[2]);
            
            this._appendToModel(vecs[3]);
            this._appendToModel(vecs[4]);
            this._appendToModel(vecs[5]);
            
            this._setIndices(counter);
            counter++;
        } 
    }
};

Water.prototype._generateLoop = function() {
    var frameTime = (Math.PI / this.gameLoop.targetFps);
    var target;
    
    for(var i = 0; i < Math.PI / this.speed; i += frameTime) {
        var tx = i * this.speed % Math.PI;
        target = this.model.clone();
            
        for(var n = 0; n < target.vertices.length; n += 3) {
            var x = target.vertices[n];
            var z = target.vertices[n + 2];
            
            target.vertices[n + 1] =
                Math.sin(tx + x * this.waveIntensity) * Math.cos(tx + z * this.waveIntensity) * this.waveHeight;
        }
        
        target.calculateNormals();
        
        this.frames.push({
            vertices: target.vertices,
            normals: target.normals
        });
    }
};

Water.prototype.generate = function (terrain, quality) {
    this.quality = quality;
    this.size = terrain.getSize() - (2 * terrain.scale);
    
    this.model = new Model(this.ctx, 'water');
    this.model.colors = [];
    this.model.normals = [];
    this.model.shininess = 1.0;
    this.model.opacity = 0.5;
    this.model.specularWeight = 0.8;
    this._build(terrain);
    this._generateLoop();
    
    return Q();
};

Water.prototype.update = function () {
    this.model.vertices = this.frames[this.currentFrame].vertices;
    this.model.normals = this.frames[this.currentFrame].normals;
    
    this.model.bindBuffers();
    this.currentFrame ++;
    
    if(this.currentFrame >= this.frames.length) {
        this.currentFrame = 0;
    }
};


Water.prototype.render = function (shader) {
    if(this.refraction) {
        this.refraction.bindDepthTexture(this.ctx.gl.TEXTURE0);
        this.refraction.bindColorTexture(this.ctx.gl.TEXTURE1);
        shader.setRefractionDepthTexture(this.refraction.depthTexture);
        shader.setRefractionColorTexture(this.refraction.colorTexture);
    }
    
    if(this.reflection) {
        this.reflection.bindColorTexture(this.ctx.gl.TEXTURE2);
        shader.setReflectionColorTexture(this.reflection.colorTexture);
    }

    this.ctx.gl.enable(this.ctx.gl.BLEND);
    this.ctx.matrix.setUniforms(shader);
    this.model.render(shader);
    this.ctx.gl.disable(this.ctx.gl.BLEND);
    
    if(this.refraction) { this.refraction.unbindTextures(); }
    if(this.reflection) { this.reflection.unbindTextures(); }
};
