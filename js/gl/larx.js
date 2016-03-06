/* global Frustum */
/* global Camera */
/* global Matrix */
/* global Q */

var Larx = { VERSION: 0.1 };

Larx.gl = undefined;

Larx.init = function(canvas) {
    Larx.Viewport.init(canvas);
    Larx.Frustum.init();
    
    Larx.gl = Larx.Viewport.canvas.getContext('webgl');
    if(!Larx.gl) { Larx.gl = this.canvas.getContext('experimental-webgl'); }
    
    Larx.gl.getExtension("OES_texture_float");
    Larx.gl.getExtension("WEBGL_depth_texture");
    
    Larx.gl.viewportWidth = Larx.Viewport.canvas.width;
    Larx.gl.viewportHeight = Larx.Viewport.canvas.height;
    
    Larx.gl.enable(Larx.gl.DEPTH_TEST);
    Larx.gl.blendFunc(Larx.gl.SRC_ALPHA, Larx.gl.ONE_MINUS_SRC_ALPHA);

    Larx.gl.enable(Larx.gl.CULL_FACE);
    Larx.gl.cullFace(Larx.gl.BACK);

    Larx.Viewport.onResize(function () {
        Larx.gl.viewportWidth = Larx.Viewport.canvas.width;
        Larx.gl.viewportHeight = Larx.Viewport.canvas.height;
    });
};

Larx.setClearColor = function(color) {
    Larx.gl.clearColor(color[0], color[1], color[2], 1.0);
};

Larx.render = function(callback) { 
    Larx.Matrix.push();
    Larx.Matrix.setIdentity();
    Larx.Frustum.extractFrustum();
    
    callback();
    
    Larx.Matrix.pop();
};

Larx.clear = function() {
    Larx.gl.viewport(0, 0, Larx.gl.viewportWidth, Larx.gl.viewportHeight);
    Larx.gl.clear(Larx.gl.COLOR_BUFFER_BIT | Larx.gl.DEPTH_BUFFER_BIT);
};

Larx.prototype = {};