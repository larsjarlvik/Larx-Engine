"use strict";

class LarxSky {
    constructor(size) {
        this.size = size;
        this.model;
    }
    
    load(name) {
        let deferred = Q.defer();
        
        this.model = new LarxModel();
        this.model.load(name).then(() => {
            this.model.scale(this.size, this.size / 2, this.size);
            this.model.bindBuffers();
            deferred.resolve();
        })
        .catch(function (err) { console.log(err); });
        
        return deferred.promise;
    }

    render(shader) {
        Larx.Matrix.setIdentity();
        Larx.Matrix.translate([Larx.Camera.look.x, -350.0, Larx.Camera.look.z]);
        Larx.Matrix.setUniforms(shader);
        
        this.model.render(shader);
    }
}