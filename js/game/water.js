/* global Q */
/* global Model */
/* global vec3 */

Larx.Water = function () {
    this.size = undefined;
    this.waveHeight = 0.25;
    this.speed = 0.01;
    this.frames = [];
    this.currentFrame = 0;
    this.refraction;
    this.reflection;
    
    this.numBlocks = 4;
};
    
    
Larx.Water.prototype = {
    
    generate: function (terrain, quality) {
        var self = this;
        var blocks = [];
        var blockSize;
        
        function appendToModel(model, vec) {
            model.vertices.push(vec[0]);
            model.vertices.push(vec[1]);
            model.vertices.push(vec[2]);
        }

        function setIndices(model, counter) {
            var start = counter * 6;

            model.indices.push(start + 0);
            model.indices.push(start + 1);
            model.indices.push(start + 2);

            model.indices.push(start + 3);
            model.indices.push(start + 4);
            model.indices.push(start + 5);
        }
        
        function getIndex(x, z) {
            return z * self.numBlocks + x;
        }
        
        function buildBlock(terrain, bx, bz) {
            var ts = blockSize / self.quality;
            var counter = 0;
            var model = new Larx.Model();
            
            model.normals = [];
            model.shininess = 1.0;
            model.opacity = 0.5;
            model.specularWeight = 0.5;
            
            for(var z = 0; z < blockSize; z += ts) {
                var vz = z;
                
                for(var x = 0; x < blockSize; x += ts) {
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
                    for(var i = 0; i < vecs.length; i++)
                        if(terrain.getElevationAtPoint(bx + vecs[i][0], bz + vecs[i][2]) <= self.waveHeight) {
                            add = true;
                            break;
                        }
                        
                    if(!add) { continue; }
                    
                    appendToModel(model, vecs[0]);
                    appendToModel(model, vecs[1]);
                    appendToModel(model, vecs[2]);
                    
                    appendToModel(model, vecs[3]);
                    appendToModel(model, vecs[4]);
                    appendToModel(model, vecs[5]);
                    
                    setIndices(model, counter);
                    counter++;
                } 
            }
            
            if(model.vertices.length == 0) {
                return undefined;
            } else {
                return model;
            }
        }
        
        function build(terrain) {
            blockSize = self.size / self.numBlocks;
            
            for(var x = 0; x < self.numBlocks; x++) {
                var bx = x * blockSize - (self.size / 2);
                
                for(var z = 0; z < self.numBlocks; z++) {
                    var bz = z * blockSize - (self.size / 2);
                    var i = z * self.numBlocks + x;
                    
                    blocks[i] = buildBlock(terrain, bx, bz);
                    if(blocks[i] !== undefined) {
                        blocks[i].x = x;
                        blocks[i].z = z;
                        blocks[i].bx = bx;
                        blocks[i].bz = bz;
                        blocks[i].setBounds();
                        blocks[i].bindBuffers(); 
                    }
                }
            }
        }
        
        function generateLoop() {
            var frameTime = (1000.0 / Larx.GameLoop.targetFps);
            var target;
            
            for(var i = 0; i < Math.PI / self.speed; i += frameTime) {
                var tx = i * self.speed;
                
                target = [];
                
                for(var n = 0; n < blocks.length; n ++) {
                    if(blocks[n] === undefined) { continue; }
                    
                    target[n] = blocks[n].clone();
                    target[n].x = blocks[n].x;
                    target[n].z = blocks[n].z;
                    target[n].bx = blocks[n].bx;
                    target[n].bz = blocks[n].bz;
                    
                    for(var v = 0; v < blocks[n].vertices.length; v += 3) {
                        target[n].vertices[v + 1] = 
                            Math.sin(tx + (target[n].x * blockSize) + blocks[n].vertices[v]) * 
                            Math.cos(tx + (target[n].z * blockSize) + blocks[n].vertices[v + 2])
                            * self.waveHeight;
                    }
                    
                    target[n].calculateNormals();
                    target[n].bindBuffers();
                }
                
                self.frames.push(target);
            }
        }
                
        this.quality = quality;
        this.size = terrain.getSize() - (2 * terrain.scale) - 0.5;
        
        build(terrain);
        generateLoop();
        
        return Q();
    },
    
    update: function () {
        this.currentFrame ++;
        this.currentFrame = this.currentFrame % this.frames.length;
    },
    
    render: function (shader) {    
        if(this.refraction) {
            this.refraction.bindDepthTexture(Larx.gl.TEXTURE0);
            this.refraction.bindColorTexture(Larx.gl.TEXTURE1);
            shader.setRefractionDepthTexture(this.refraction.depthTexture);
            shader.setRefractionColorTexture(this.refraction.colorTexture);
        }
        
        if(this.reflection) {
            this.reflection.bindColorTexture(Larx.gl.TEXTURE2);
            shader.setReflectionColorTexture(this.reflection.colorTexture);
        }
        
        for(var i = 0; i < this.numBlocks * this.numBlocks; i ++) {
            if(this.frames[this.currentFrame][i] === undefined) { continue; }
            
            this.frames[this.currentFrame][i].render(shader, [
                this.frames[this.currentFrame][i].bx, 0, 
                this.frames[this.currentFrame][i].bz]);
        }
    
        
        if(this.refraction) { this.refraction.unbindTextures(); }
        if(this.reflection) { this.reflection.unbindTextures(); }
    }
};
