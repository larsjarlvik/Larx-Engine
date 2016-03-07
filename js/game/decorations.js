Larx.Decorations = function(terrain) {
    this.terrain = terrain;
    
    this.numBlocks = 6;
    this.size = this.terrain.getSize() - 0.5;
    this.blockSize = this.size / this.numBlocks;
    
    this.decorsAboveWL = [];
    this.decorsBelowWL = [];
    
    this.flags = { default: 0, reflect: 1, refract: 2 };
    
    
    function initDecorBlock(bx, bz) {
        var model = new Larx.Model();
        model.x = bx;
        model.z = bz;
        model.shininess = 1.0;
        model.specularWeight = 1.0;
        
        return model;
    }
    
    for(var x = 0; x < this.numBlocks; x++) {
        var bx = x * this.blockSize - (this.size / 2);
    
        for(var z = 0; z < this.numBlocks; z++) {
            var bz = z * this.blockSize - (this.size / 2);
            var i = z * this.numBlocks + x;
            
            this.decorsAboveWL[i] = initDecorBlock(bx, bz);
            this.decorsBelowWL[i] = initDecorBlock(bx, bz);
        }
    }
};

Larx.Decorations.prototype = {
    push: function (model, xz, rotate, scaleLimit, yLimit, tiltToTerrain, tiltLimit) {
        var self = this;
        
        function testBounds (coords, yLimits) {
            var bounds = (self.size - (self.terrain.scale * 4)) / 2;
            
            return (
                coords[1] >= yLimits[0] * self.terrain.scale && 
                coords[1] <= yLimits[1] * self.terrain.scale && 
                coords[0] > -bounds && coords[0] < bounds && 
                coords[2] > -bounds && coords[2] < bounds);
        }
        
        var x = xz[0] - (this.terrain.getSize() / 2);
        var z = xz[1] - (this.terrain.getSize() / 2);
        var by = this.terrain.getElevationAtPoint(x, z);
        
        if(!testBounds([x, by, z], yLimit)) { return false; }
        
        var block = [Math.floor(xz[1] / this.blockSize), Math.floor(xz[0] / this.blockSize)];
        var blockIndex = block[0] * this.numBlocks + block[1];
        
        var m = model.clone();
        m.scale(Math.random() * (scaleLimit[1] - scaleLimit[0]) + scaleLimit[0]);
        m.setBounds();
        
        var rotation = [0, 0, 0];
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
    },
    
    bind: function() {
        for(var i = 0; i < this.decorsAboveWL.length; i ++) {
            
            this.decorsAboveWL[i].setBounds();
            this.decorsAboveWL[i].bindBuffers();
        }
        
        for(var i = 0; i < this.decorsBelowWL.length; i ++) {
            this.decorsBelowWL[i].setBounds();
            this.decorsBelowWL[i].bindBuffers();
        }
    },

    render: function(shader, clip, flag) {
        
        if(flag !== this.flags.refract) {
            for(var i = 0; i < this.decorsAboveWL.length; i ++) {
                if(this.decorsAboveWL[i].vertices.length === 0) { continue; }
                this.decorsAboveWL[i].render(shader, flag === this.flags.reflect);
            }  
        }

        if(flag !== this.flags.reflect) {
            for(var i = 0; i < this.decorsBelowWL.length; i ++) {
                if(this.decorsBelowWL[i].vertices.length === 0) { continue; }
                this.decorsBelowWL[i].render(shader, flag === this.flags.reflect);
            }  
        }
    }
};

