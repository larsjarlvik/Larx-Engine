/* global Larx */

var Sky = function(size) {
    this.size = size;
    this.model;
};

Sky.prototype.load = function(name) {
    var deferred = Q.defer();
    var self = this;
    
    this.model = new Larx.Model();
    this.model.load(name).then(function() {
        self.model.scale(self.size, self.size / 2, self.size);
        self.model.bindBuffers();
        deferred.resolve();
    })
    .catch(function (err) { console.log(err); });
    
    return deferred.promise;
};

Sky.prototype.render = function(shader) {
    Larx.Matrix.setIdentity();
    Larx.Matrix.translate([Larx.Camera.look.x, -350.0, Larx.Camera.look.z]);
    Larx.Matrix.setUniforms(shader);
    
    this.model.render(shader);
};