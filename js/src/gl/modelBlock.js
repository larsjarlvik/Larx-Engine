'use strict';

class LarxModelBlock {
        
    constructor(size, maxDepth) {
        this.size = size;
        this.pos = -(size / 2);
        
        this.maxDepth = maxDepth;
        this.root = {};
        
        this.initializeBlock(this.root, this.pos, this.pos, 0);
    }
    
    initializeBlock(block, x, z, depth) {
        block.pos = {
            x: x,
            z: z
        }
        
        block.depth = depth;
        
        if(depth >= this.maxDepth) {
            block.model = new LarxModel();
            return;
        }
        
        block.children = [[{}, {}], [{}, {}]];
        
        let blockSize = this.size;
        for(let i = 0; i < depth + 1; i ++) { blockSize /= 2; }
        
        for(let nx = 0; nx < 2; nx++) {
            for(let nz = 0; nz < 2; nz++) {
                this.initializeBlock(block.children[nx][nz], x + (nx * blockSize), z + (nz * blockSize), depth + 1);
            }
        }
    }
    
    push(model) {
        this.pushToBlock(this.root, model);
    }
    
    pushToBlock(block, model) {
        if(block.children === undefined) { 
            block.model.push(model.clone());
            return; 
        }
        
        for(let x = 1; x >= 0; x--) {
            for(let z = 1; z >= 0; z--) {
                if (block.children[x][z].pos.x <= model.bounds.vMin[0] && 
                    block.children[x][z].pos.z <= model.bounds.vMin[2]) {
                    this.pushToBlock(block.children[x][z], model);
                    return;
                }
            }
        }
    }
    
    render(shader) {
        this.renderBlock(shader, this.root);
    }
    
    renderBlock(shader, block) {
        if(block.children === undefined) {
            block.model.render(shader);
            return;   
        }
        
        if(this.inFrustum(block.children[0][0])) { this.renderBlock(shader, block.children[0][0]); }
        if(this.inFrustum(block.children[0][1])) { this.renderBlock(shader, block.children[0][1]); }
        if(this.inFrustum(block.children[1][0])) { this.renderBlock(shader, block.children[1][0]); }
        if(this.inFrustum(block.children[1][1])) { this.renderBlock(shader, block.children[1][1]); }
    }
    
    inFrustum(block) {
        return !block.model || (block.model.indices.length && Larx.Frustum.inFrustum(block.model.bounds.vMin, block.model.bounds.vMax));
    }
    
    bind() {
        this.bindBlock(this.root);
    }
    
    bindBlock(block) {
        if(block.children === undefined) {
            block.model.setBounds();
            block.model.bindBuffers();
            return;
        }

        this.bindBlock(block.children[0][0]);
        this.bindBlock(block.children[0][1]);
        this.bindBlock(block.children[1][0]);
        this.bindBlock(block.children[1][1]);
    }
    
    clone() {
        let target = new LarxModelBlock(this.size, this.maxDepth);
        this.cloneBlock(target.root, this.root);
        
        return target;
    }
    
    cloneBlock(target, source) {
        if(source.children === undefined) { 
            target.model.push(source.model.clone());
            return; 
        }
        
        for(let x = 0; x < 2; x++) {
            for(let z = 0; z < 2; z++) {
                this.cloneBlock(target.children[x][z], source.children[x][z]);
            }
        }
    }
    
    getModels() {
        return this.getBlockModels(this.root);
    }
    
    getBlockModels(block) {
        if(block.children === undefined) { 
            return block.model;
        }
        
        for(let x = 0; x < 2; x++) {
            for(let z = 0; z < 2; z++) {
                return this.getBlockModels(block.children[x][z]);
            }
        }
    }
}