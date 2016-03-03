/* global Camera */
/* global Matrix */
/* global Q */

var Larx = function (viewport, clearColor) {
    this.gl;
    this.camera;
    this.matrix;
    this.model;
    this.canvas;
    
    this.viewport = viewport;
    this._init();
    this.setClearColor(clearColor);
};

Larx.prototype._init = function() {
    var self = this;
    this.canvas = this.viewport.canvas;

    this.gl = this.canvas.getContext('webgl');
    if(!this.gl) { this.gl = this.canvas.getContext('experimental-webgl'); }
    
    this.gl.getExtension("OES_texture_float");
    this.gl.getExtension("WEBGL_depth_texture");
    
    this.gl.viewportWidth = this.canvas.width;
    this.gl.viewportHeight = this.canvas.height;
    
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    this.viewport.onResize(function () {
        self.gl.viewportWidth = self.canvas.width;
        self.gl.viewportHeight = self.canvas.height;
    });
    
    this.camera = new Camera();
    this.matrix = new Matrix(this);
};

Larx.prototype.setClearColor = function(color) {
    this.gl.clearColor(color[0], color[1], color[2], 1.0);
};

Larx.prototype.render = function(callback) {    
    this.matrix.push();
    
    callback();
    
    this.matrix.pop();
};

Larx.prototype.clear = function() {
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
};

