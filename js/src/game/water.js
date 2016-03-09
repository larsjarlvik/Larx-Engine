"use strict";

class LarxWater {
    constructor () {
        this.size = undefined;
        this.waveHeight = 0.25;
        this.speed = 0.01;
        this.frames = [];
        this.currentFrame = 0;
        this.refraction;
        this.reflection;
        
        this.numBlocks = 4;
    }
    
    build(terrain) {
        this.blocks = [];
        this.blockSize = this.size / this.numBlocks;
        
        for(var x = 0; x < this.numBlocks; x++) {
            var bx = x * this.blockSize - (this.size / 2);
            
            for(var z = 0; z < this.numBlocks; z++) {
                var bz = z * this.blockSize - (this.size / 2);
                var i = z * this.numBlocks + x;
                
                this.blocks[i] = this.buildBlock(terrain, bx, bz);
                if(this.blocks[i] !== undefined) {
                    this.blocks[i].x = x;
                    this.blocks[i].z = z;
                    this.blocks[i].setBounds();
                    this.blocks[i].bindBuffers(); 
                }
            }
        }
    }
    
    buildBlock(terrain, bx, bz) {
        function append(model, vec) {
            model.vertices.push(bx + vec[0]);
            model.vertices.push(vec[1]);
            model.vertices.push(bz + vec[2]);
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
        
        var ts = this.blockSize / this.quality;
        var counter = 0;
        var model = new LarxModel();
        
        model.normals = [];
        model.shininess = 3.0;
        model.opacity = 0.5;
        model.specularWeight = 0.5;
        
        for(var z = 0; z < this.blockSize; z += ts) {
            var vz = z;
            
            for(var x = 0; x < this.blockSize; x += ts) {
                var vecs = [];
                var vx = x;
                
                if((x%2 === 0 && z%2 === 0) || (x%2 === 1 && z%2 === 1)) {
                    vecs.push([vx + ts, 0, vz]);
                    vecs.push([vx, 0, vz]);
                    vecs.push([vx, 0, vz + ts]);
                    
                    vecs.push([vx + ts, 0, vz]);
                    vecs.push([vx, 0, vz + ts]);
                    vecs.push([vx + ts, 0, vz + ts]);
                } else {
                    vecs.push([vx + ts, 0, vz + ts]);
                    vecs.push([vx, 0, vz]);
                    vecs.push([vx, 0, vz + ts]);
                    
                    vecs.push([vx + ts, 0, vz]);
                    vecs.push([vx, 0, vz]);
                    vecs.push([vx + ts, 0, vz + ts]);
                }
                
                var add = false;
                for(var i = 0; i < vecs.length; i++)
                    if(terrain.getElevationAtPoint(bx + vecs[i][0], bz + vecs[i][2]) <= this.waveHeight) {
                        add = true;
                        break;
                    }
                    
                if(!add) { continue; }
                
                append(model, vecs[0]);
                append(model, vecs[1]);
                append(model, vecs[2]);
                
                append(model, vecs[3]);
                append(model, vecs[4]);
                append(model, vecs[5]);
                
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
    
    generateLoop(targetFps) {
        var frameTime = (1000.0 / targetFps);
        var target;
        
        for(var i = 0; i < Math.PI / this.speed; i += frameTime) {
            var tx = i * this.speed;
            
            target = [];
            
            for(var n = 0; n < this.blocks.length; n ++) {
                if(this.blocks[n] === undefined) { continue; }
                
                target[n] = this.blocks[n].clone();
                target[n].x = this.blocks[n].x;
                target[n].z = this.blocks[n].z;
                target[n].bx = this.blocks[n].bx;
                target[n].bz = this.blocks[n].bz;
                
                for(var v = 0; v < this.blocks[n].vertices.length; v += 3) {
                    target[n].vertices[v + 1] = 
                        Math.sin(tx + this.blocks[n].vertices[v]) * 
                        Math.cos(tx + this.blocks[n].vertices[v + 2])
                        * this.waveHeight;
                }
                
                target[n].calculateNormals();
                target[n].bindBuffers();
            }
            
            this.frames.push(target);
        }
    }
    
    generate(terrain, quality, targetFps) {
        this.quality = quality;
        this.size = terrain.getSize() - (2 * terrain.scale) - 0.5;
        
        this.build(terrain);
        this.generateLoop(targetFps);
        
        return Promise.resolve();
    }
    
    update() {
        this.currentFrame ++;
        this.currentFrame = this.currentFrame % this.frames.length;
    }
    
    render(shader) { 
           
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
            
            this.frames[this.currentFrame][i].render(shader);
        }
    
        
        if(this.refraction) { this.refraction.unbindTextures(); }
        if(this.reflection) { this.reflection.unbindTextures(); }
    }
};
