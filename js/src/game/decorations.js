"use strict";

class LarxDecorations {
    constructor(terrain) {
        this.terrain = terrain;
        
        this.numBlocks = 12;
        this.size = this.terrain.getSize() - 0.5;
        this.blockSize = this.size / this.numBlocks;
        
        this.decorsAboveWL = [];
        this.decorsBelowWL = [];
        
        this.flags = { default: 0, reflect: 1, refract: 2 };
        
        function initDecorBlock(bx, bz) {
            let model = new LarxModel();
            model.x = bx;
            model.z = bz;
            model.shininess = 1.0;
            model.specularWeight = 1.0;
            
            return model;
        }
        
        for(let x = 0; x < this.numBlocks; x++) {
            let bx = x * this.blockSize - (this.size / 2);
        
            for(let z = 0; z < this.numBlocks; z++) {
                let bz = z * this.blockSize - (this.size / 2);
                let i = z * this.numBlocks + x;
                
                this.decorsAboveWL[i] = initDecorBlock(bx, bz);
                this.decorsBelowWL[i] = initDecorBlock(bx, bz);
            }
        }
    }
    
    testBounds(coords, yLimits) {
        let bounds = (this.size - (this.terrain.scale * 4)) / 2;
        
        return (
            coords[1] >= yLimits[0] * this.terrain.scale && 
            coords[1] <= yLimits[1] * this.terrain.scale && 
            coords[0] > -bounds && coords[0] < bounds && 
            coords[2] > -bounds && coords[2] < bounds);
    }
    
    push(model, xz, rotate, scaleLimit, yLimit, tiltToTerrain, tiltLimit) {
        let x = xz[0] - (this.terrain.getSize() / 2);
        let z = xz[1] - (this.terrain.getSize() / 2);
        let by = this.terrain.getElevationAtPoint(x, z);
        
        if(!this.testBounds([x, by, z], yLimit)) { return false; }
        
        let block = [Math.floor(xz[1] / this.blockSize), Math.floor(xz[0] / this.blockSize)];
        let blockIndex = block[0] * this.numBlocks + block[1];
        
        let m = model.clone();
        m.scale(Math.random() * (scaleLimit[1] - scaleLimit[0]) + scaleLimit[0]);
        m.setBounds();
        
        let rotation = [0, 0, 0];
        if(rotate) { rotation[1] = Math.random() * Math.PI }
        if(tiltToTerrain) {
            rotation = this.terrain.getAngle(x, z, m.getSize()[0], m.getSize()[2]);
        }
        
        if(tiltLimit > 0.0) {
            rotation[0] += (Math.random() - 0.5) * Math.PI / tiltLimit;
            rotation[2] += (Math.random() - 0.5) * Math.PI / tiltLimit;
        } 
        
        m.rotate(rotation);
        m.translate([x, by, z]);
        m.setBounds();
        
        if(by + m.bounds.vMin[1] > -0.5) {
            this.decorsAboveWL[blockIndex].push(m);
        } else {
            this.decorsBelowWL[blockIndex].push(m);
        }
        
        return true;
    }
    
    bind() {
        for(let i = 0; i < this.decorsAboveWL.length; i ++) {
            
            this.decorsAboveWL[i].setBounds();
            this.decorsAboveWL[i].bindBuffers();
        }
        
        for(let i = 0; i < this.decorsBelowWL.length; i ++) {
            this.decorsBelowWL[i].setBounds();
            this.decorsBelowWL[i].bindBuffers();
        }
    }

    render(shader, clip, flag) {
        
        if(flag !== this.flags.refract) {
            for(let i = 0; i < this.decorsAboveWL.length; i ++) {
                if(this.decorsAboveWL[i].vertices.length === 0) { continue; }
                this.decorsAboveWL[i].render(shader, flag === this.flags.reflect);
            }  
        }

        if(flag !== this.flags.reflect) {
            for(let i = 0; i < this.decorsBelowWL.length; i ++) {
                if(this.decorsBelowWL[i].vertices.length === 0) { continue; }
                this.decorsBelowWL[i].render(shader, flag === this.flags.reflect);
            }  
        }
    }
}