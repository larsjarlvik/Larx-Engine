/* global Model */

var Sky = function(ctx, size) {
    this.ctx = ctx;
    this.size = size;
    this.model;
};

Sky.prototype.load = function(name) {
    var deferred = Q.defer();
    var self = this;
    
    this.model = new Model(this.ctx, name);
    this.model.load(name).then(function() {
        self.model.scale(self.size, self.size / 2, self.size);
        self.model.bindBuffers();
        deferred.resolve();
    })
    .catch(function (err) { console.log(err); });
    
    return deferred.promise;
};

Sky.prototype.render = function(shader) {
    this.ctx.matrix.setIdentity();
    this.ctx.matrix.translate([this.ctx.camera.look.x, -250.0, this.ctx.camera.look.z]);
    this.ctx.matrix.setUniforms(shader);
    
    this.model.render(shader);
};