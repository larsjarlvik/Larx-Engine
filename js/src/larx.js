'use strict';

class Larx {
	static init(canvas, renderMode) {
		
		Larx.renderMode = renderMode;
		
		this.Viewport = new LarxViewport(canvas);
		this.initGL();
		
		this.Frustum = new LarxFrustum();
		this.Camera = new LarxCamera();
		this.Fxaa = new LarxFxaa();
		this.Matrix = new LarxMatrix();
		this.Shadows = new LarxShadows();
		this.Math = new LarxMath();
		
		Larx.gl.getExtension("OES_texture_float");
		Larx.gl.getExtension("WEBGL_depth_texture");
		
		Larx.gl.viewportWidth = Larx.gl.drawingBufferWidth;
		Larx.gl.viewportHeight = Larx.gl.drawingBufferHeight;
		Larx.Matrix.aspect = Larx.gl.viewportWidth / Larx.gl.viewportHeight;
		
		Larx.gl.enable(Larx.gl.DEPTH_TEST);
		Larx.gl.blendFunc(Larx.gl.SRC_ALPHA, Larx.gl.ONE_MINUS_SRC_ALPHA);

		Larx.gl.enable(Larx.gl.CULL_FACE);
		Larx.gl.cullFace(Larx.gl.BACK);

		Larx.Viewport.onResize(() => {
			Larx.gl.viewportWidth = Larx.Viewport.canvas.width;
			Larx.gl.viewportHeight = Larx.Viewport.canvas.height;
			Larx.Matrix.aspect = Larx.gl.viewportWidth / Larx.gl.viewportHeight;
			
			if(renderMode === Larx.RENDER_MODES.FXAA) { Larx.Fxaa.buildFramebuffer(); }
		});
		
		return renderMode === Larx.RENDER_MODES.FXAA ? Larx.Fxaa.init() : Promise.resolve();
	}
	
	static initGL() {
		let antialias = false;
		if(Larx.renderMode == Larx.RENDER_MODES.MSAA) {
			antialias = true;
		}
		
		Larx.gl = Larx.Viewport.canvas.getContext('webgl', { antialias: antialias });
		if(!Larx.gl) { Larx.gl = Larx.Viewport.canvas.getContext('experimental-webgl', { antialias: antialias }); }
	}
	
	static setClearColor(color) {
		Larx.gl.clearColor(color[0], color[1], color[2], 1.0);
	}
	
	static render(drawCallback) {
		Larx.clear();
		Larx.Matrix.push();
		Larx.Matrix.setPerspectiveProjection();
		Larx.Matrix.setIdentity(this.Camera.getMatrix());
		Larx.Frustum.extractFrustum();
		
		Larx.gl.enable(Larx.gl.DEPTH_TEST); 
		
		if(Larx.renderMode == Larx.RENDER_MODES.FXAA) { Larx.Fxaa.bind(); }
		
		drawCallback();
		
		if(Larx.renderMode == Larx.RENDER_MODES.FXAA) { Larx.Fxaa.draw(); }
		Larx.Matrix.pop();
	}
	
	static clear() {
		Larx.gl.viewport(0, 0, Larx.gl.viewportWidth, Larx.gl.viewportHeight);
		Larx.gl.clear(Larx.gl.COLOR_BUFFER_BIT | Larx.gl.DEPTH_BUFFER_BIT);
	}
}

Larx.VERSION = 1.0;
Larx.RENDER_MODES = { NONE: 0, FXAA: 1, MSAA: 2 };
	