'use strict';

class LarxDecorations {
    constructor(terrain) {
        this.terrain = terrain;
        
        this.size = this.terrain.getSize() - 0.5;
        this.flags = { default: 0, reflect: 1, refract: 2 };
        
        this.blocks = new LarxModelBlock(this.size, 2);
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
        
        this.blocks.push(m);
        
        return true;
    }
    
    bind() {
        this.blocks.bind();
    }
    
    render(sp) {
        Larx.gl.uniform1f(sp.shader.shininess, 3.0);
        Larx.gl.uniform1f(sp.shader.specularWeight, 0.7);
        
        this.blocks.render(sp);
    }
}