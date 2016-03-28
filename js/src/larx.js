'use strict';

class Larx {
	static init(canvas, clearColor) {
		this.clearColor = clearColor;
		this.Viewport = new LarxViewport(canvas);
		this.initGL();
		
		this.Frustum = new LarxFrustum();
		this.Camera = new LarxCamera();
		this.PostProcessing = new LarxPostProcessing();
		this.Matrix = new LarxMatrix();
		this.Shadows = new LarxShadows();
		this.Math = new LarxMath();
		
		
		Larx.gl.getExtension("OES_texture_float");
		Larx.gl.getExtension("WEBGL_depth_texture");
		
		Larx.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
		
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
			Larx.PostProcessing.resize();
		});
		
		return Larx.PostProcessing.init();
	}
	
	static initGL() {
		Larx.gl = Larx.Viewport.canvas.getContext('webgl', { antialias: false });
		if(!Larx.gl) { Larx.gl = Larx.Viewport.canvas.getContext('experimental-webgl', { antialias: false }); }
	}
	
	static render(drawCallback) {
		Larx.Matrix.push();
		Larx.Matrix.setPerspectiveProjection();
		Larx.Matrix.setIdentity(this.Camera.getMatrix());
		Larx.Frustum.extractFrustum();
		
		Larx.gl.enable(Larx.gl.DEPTH_TEST); 
		if(!Larx.PostProcessing.bind()) {
			return;
		}
		
		drawCallback();
		
		// POST PROCESSING
		Larx.gl.disable(Larx.gl.DEPTH_TEST);
		Larx.PostProcessing.render();
		Larx.Matrix.pop();
	}
	
	static clear() {
		Larx.gl.viewport(0, 0, Larx.gl.viewportWidth, Larx.gl.viewportHeight);
		Larx.gl.clear(Larx.gl.COLOR_BUFFER_BIT | Larx.gl.DEPTH_BUFFER_BIT);
	}
}

Larx.VERSION = 1.0;
Larx.RENDER_MODES = { NONE: 0, FXAA: 1 };
	