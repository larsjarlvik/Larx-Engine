/* global Camera */
/* global Matrix */
/* global Q */

var Larx = function (viewport) {
    this.gl;
    this.camera;
    this.matrix;
    this.model;
    
    this.viewport = viewport;
    this._init();
};

Larx.prototype._init = function() {
    var canvas = this.viewport.canvas;
    var self = this;

    this.gl = canvas.getContext('webgl');
    if(!this.gl) { this.gl = canvas.getContext('experimental-webgl'); }

    this.gl.viewportWidth = canvas.width;
    this.gl.viewportHeight = canvas.height;

    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.BLEND);
    this.gl.disable(this.gl.DEPTH_TEST);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    this.gl.getExtension("WEBGL_depth_texture");

    this.viewport.resize(function () {
        self.gl.viewportWidth = canvas.width;
        self.gl.viewportHeight = canvas.height;
    });
    
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    
    this.camera = new Camera();
    this.matrix = new Matrix(this);
};

Larx.prototype.render = function(callback) {  
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    this.matrix.setIdentity();
    this.matrix.push();
    
    callback();
    
    this.matrix.pop();
};

