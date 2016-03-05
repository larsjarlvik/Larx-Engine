/* global Q */
/* global Model */
/* global vec3 */

var Water = function (ctx, gameLoop) {
    this.ctx = ctx;
    this.gameLoop = gameLoop;
    this.size = undefined;
    this.waveHeight = 0.25;
    this.speed = 0.01;
    this.frames = [];
    this.currentFrame = 0;
    this.refraction;
    this.reflection;
    
    this._numBlocks = 4;
    this._blockSize;
    this._blocks = [];
};
    
    
Water.prototype._appendToModel = function(model, vec) {
    model.vertices.push(vec[0]);
    model.vertices.push(vec[1]);
    model.vertices.push(vec[2]);
};

Water.prototype._setIndices = function(model, counter) {
    var start = counter * 6;

    model.indices.push(start + 0);
    model.indices.push(start + 1);
    model.indices.push(start + 2);

    model.indices.push(start + 3);
    model.indices.push(start + 4);
    model.indices.push(start + 5);
};

Water.prototype._getIndex = function (x, z) {
    return z * this._numBlocks + x;
};

Water.prototype._build = function(terrain) {
    this._blockSize = this.size / this._numBlocks;
    
    for(var x = 0; x < this._numBlocks; x++) {
        var bx = x * this._blockSize - (this.size / 2);
        
        for(var z = 0; z < this._numBlocks; z++) {
            var bz = z * this._blockSize - (this.size / 2);
            var i = z * this._numBlocks + x;
            
            this._blocks[i] = this._buildBlock(terrain, bx, bz);
            if(this._blocks[i] !== undefined) {
                this._blocks[i].x = x;
                this._blocks[i].z = z;
                this._blocks[i].bx = bx;
                this._blocks[i].bz = bz;
                this._blocks[i].setBounds();
                this._blocks[i].bindBuffers(); 
            }
        }
    }
};

Water.prototype._buildBlock = function(terrain, bx, bz) {
    var ts = this._blockSize / this.quality;
    var counter = 0;
    var model = new Model(this.ctx, 'waterBlock');
    
    model.normals = [];
    model.shininess = 1.0;
    model.opacity = 0.5;
    model.specularWeight = 0.8;
    
    for(var z = 0; z < this._blockSize; z += ts) {
        var vz = z;
        
        for(var x = 0; x < this._blockSize; x += ts) {
            var vecs = [];
            var vx = x;
            
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
                var elev = terrain.getElevationAtPoint(bx + vecs[i][0], bz + vecs[i][2]);
                if(elev <= this.waveHeight) {
                    add = true;
                    break;
                }
            }
            
            if(!add) { continue; }
            
            this._appendToModel(model, vecs[0]);
            this._appendToModel(model, vecs[1]);
            this._appendToModel(model, vecs[2]);
            
            this._appendToModel(model, vecs[3]);
            this._appendToModel(model, vecs[4]);
            this._appendToModel(model, vecs[5]);
            
            this._setIndices(model, counter);
            counter++;
        } 
    }
    
    if(model.vertices.length == 0) {
        return undefined;
    } else {
        return model;
    }
};

Water.prototype._generateLoop = function() {
    var frameTime = (1000.0 / this.gameLoop.targetFps);
    var target;
    
    for(var i = 0; i < Math.PI / this.speed; i += frameTime) {
        var tx = i * this.speed;
        
        target = [];
        
        for(var n = 0; n < this._blocks.length; n ++) {
            if(this._blocks[n] === undefined) { continue; }
            
            target[n] = this._blocks[n].clone();
            target[n].x = this._blocks[n].x;
            target[n].z = this._blocks[n].z;
            target[n].bx = this._blocks[n].bx;
            target[n].bz = this._blocks[n].bz;
            
            for(var v = 0; v < this._blocks[n].vertices.length; v += 3) {
                target[n].vertices[v + 1] = 
                    Math.sin(tx + (target[n].x * this._blockSize) + this._blocks[n].vertices[v]) * 
                    Math.cos(tx + (target[n].z * this._blockSize) + this._blocks[n].vertices[v + 2])
                    * this.waveHeight;
            }
            
            target[n].calculateNormals();
            target[n].bindBuffers();
        }
        
        this.frames.push(target);
    }
};

Water.prototype.generate = function (terrain, quality) {
    this.quality = quality;
    this.size = terrain.getSize() - (2 * terrain.scale) - 0.5;
    
    this._build(terrain);
    this._generateLoop();
    
    return Q();
};

Water.prototype.update = function () {
    this.currentFrame ++;
    this.currentFrame = this.currentFrame % this.frames.length;
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
    
    for(var i = 0; i < this._blocks.length; i ++) {
        if(this.frames[this.currentFrame][i] === undefined) { continue; }
        
        this.frames[this.currentFrame][i].render(shader, [
            this.frames[this.currentFrame][i].bx, 0, 
            this.frames[this.currentFrame][i].bz]);
    }
   
    
    if(this.refraction) { this.refraction.unbindTextures(); }
    if(this.reflection) { this.reflection.unbindTextures(); }
};
