var Larx = { VERSION: 0.1 };
Larx.RENDER_MODES = {
    NONE: { id: 0, antialias: false },
    FXAA: { id: 1, antialias: false },
    MSAA: { id: 2, antialias: true },
};

Larx.init = function(canvas, renderMode) {
    Larx.Viewport.init(canvas);
    Larx.Frustum.init();
    Larx.renderMode = renderMode;
    
    Larx.gl = Larx.Viewport.canvas.getContext('webgl', { antialias: renderMode.antialias });
    if(!Larx.gl) { Larx.gl = this.canvas.getContext('experimental-webgl', { antialias: renderMode.antialias }); }
    
    Larx.gl.getExtension("OES_texture_float");
    Larx.gl.getExtension("WEBGL_depth_texture");
    
    Larx.gl.viewportWidth = Larx.gl.drawingBufferWidth;
    Larx.gl.viewportHeight = Larx.gl.drawingBufferHeight;
    Larx.Matrix.aspect = Larx.gl.viewportWidth / Larx.gl.viewportHeight;
    
    Larx.gl.enable(Larx.gl.DEPTH_TEST);
    Larx.gl.blendFunc(Larx.gl.SRC_ALPHA, Larx.gl.ONE_MINUS_SRC_ALPHA);

    Larx.gl.enable(Larx.gl.CULL_FACE);
    Larx.gl.cullFace(Larx.gl.BACK);

    Larx.Viewport.onResize(function () {
        Larx.gl.viewportWidth = Larx.Viewport.canvas.width;
        Larx.gl.viewportHeight = Larx.Viewport.canvas.height;
        Larx.Matrix.aspect = Larx.gl.viewportWidth / Larx.gl.viewportHeight;
    });
    
    if(renderMode === Larx.RENDER_MODES.FXAA) {
        return Larx.Fxaa.init();
    } else {
        return Q();
    }
};

Larx.setClearColor = function(color) {
    Larx.gl.clearColor(color[0], color[1], color[2], 1.0);
};

Larx.render = function(drawCallback) {    
    Larx.clear();
    Larx.Matrix.push();
    Larx.Matrix.setIdentity();
    Larx.Frustum.extractFrustum();
    
    Larx.gl.enable(Larx.gl.DEPTH_TEST); 
    
    if(Larx.renderMode == Larx.RENDER_MODES.FXAA) { Larx.Fxaa.bind(); }
    
    drawCallback();
    
    if(Larx.renderMode == Larx.RENDER_MODES.FXAA) { Larx.Fxaa.draw(); }
    Larx.Matrix.pop();
};

Larx.clear = function() {
    Larx.gl.viewport(0, 0, Larx.gl.viewportWidth, Larx.gl.viewportHeight);
    Larx.gl.clear(Larx.gl.COLOR_BUFFER_BIT | Larx.gl.DEPTH_BUFFER_BIT);
};

Larx.prototype = {};