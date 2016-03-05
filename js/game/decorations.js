var Decorations = function(ctx, terrain) {
    this.ctx = ctx;
    this.terrain = terrain;
    
    this._numBlocks = 4;
    this._blockSize;
    this.size = undefined;
    
    this._decorsAboveWL = [];
    this._decorsBelowWL = [];
    
    this._initDecorBlocks();
    this.flags = { default: 0, reflect: 1, refract: 2 };
};

Decorations.prototype._initDecorBlocks = function () {
    this.size = this.terrain.getSize() - 0.5;
    this._blockSize = this.size / this._numBlocks;
    
    for(var x = 0; x < this._numBlocks; x++) {
        var bx = x * this._blockSize - (this.size / 2);
    
        for(var z = 0; z < this._numBlocks; z++) {
            var bz = z * this._blockSize - (this.size / 2);
            var i = z * this._numBlocks + x;
            
            this._decorsAboveWL[i] = this._initDecorBlock(bx, bz);
            this._decorsBelowWL[i] = this._initDecorBlock(bx, bz);
        }
    }
};

Decorations.prototype._initDecorBlock = function (bx, bz) {
    var model = new Model(this.ctx, 'decorBlock');
    model.x = bx;
    model.z = bz;
    model.shininess = 1.0;
    model.specularWeight = 1.0;
    
    return model;
};

Decorations.prototype._testBounds = function (coords, yLimits) {
    var bounds = (this.size - (this.terrain.scale * 4)) / 2;
    
    return (
        coords[1] >= yLimits[0] * this.terrain.scale && 
        coords[1] <= yLimits[1] * this.terrain.scale && 
        coords[0] > -bounds && coords[0] < bounds && 
        coords[2] > -bounds && coords[2] < bounds);
};


Decorations.prototype.push = function (model, xz, rotate, scaleLimit, yLimit, tiltToTerrain, tiltLimit) {
    var bx = xz[0] % this._blockSize;
    var bz = xz[1] % this._blockSize;
    
    var x = xz[0] - (this.terrain.getSize() / 2);
    var z = xz[1] - (this.terrain.getSize() / 2);
    
    var by = this.terrain.getElevationAtPoint(x, z);
    
    if(!this._testBounds([x, by, z], yLimit)) { return false; }
    
    var block = [Math.floor(xz[1] / this._blockSize), Math.floor(xz[0] / this._blockSize)];
    var blockIndex = block[0] * this._numBlocks + block[1];
    
    var m = model.clone();
    var rotation = [0, 0, 0];
    
    m.scale(Math.random() * (scaleLimit[1] - scaleLimit[0]) + scaleLimit[0]);
    m.setBounds();
    
    if(rotate) { rotation[1] = Math.random() * Math.PI }
    if(tiltToTerrain) {
        rotation = this.terrain.getAngle(x, z, m.getSize()[0], m.getSize()[2]);
    }
    
    if(tiltLimit > 0.0) {
        rotation[0] += (Math.random() - 0.5) * Math.PI / tiltLimit;
        rotation[2] += (Math.random() - 0.5) * Math.PI / tiltLimit;
    } 
   
    
    m.rotate(rotation);
    m.translate([bx, by, bz]);
    m.setBounds();
    
    var target;
    if(by + m.bounds.vMin[1] > -0.5) {
        target = this._decorsAboveWL[blockIndex];
    } else {
        target = this._decorsBelowWL[blockIndex];
    }
    
    target.push(m);   
    return true;
};

Decorations.prototype.bind = function() {
    for(var i = 0; i < this._decorsAboveWL.length; i ++) {
        
        this._decorsAboveWL[i].setBounds();
        this._decorsAboveWL[i].bindBuffers();
    }
    
    for(var i = 0; i < this._decorsBelowWL.length; i ++) {
        this._decorsBelowWL[i].setBounds();
        this._decorsBelowWL[i].bindBuffers();
    }
};

Decorations.prototype.render = function(shader, flag) {
    if(flag !== this.flags.refract) {
        for(var i = 0; i < this._decorsAboveWL.length; i ++) {
            if(this._decorsAboveWL[i].vertices.length === 0) { continue; }
            this._decorsAboveWL[i].render(shader, [this._decorsAboveWL[i].x, 0, this._decorsAboveWL[i].z], flag === this.flags.reflect);
        }  
    }

    if(flag !== this.flags.reflect) {
        for(var i = 0; i < this._decorsBelowWL.length; i ++) {
            if(this._decorsBelowWL[i].vertices.length === 0) { continue; }
            this._decorsBelowWL[i].render(shader, [this._decorsBelowWL[i].x, 0, this._decorsBelowWL[i].z], flag === this.flags.reflect);
        }  
    }
};