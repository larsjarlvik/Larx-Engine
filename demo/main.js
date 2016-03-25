/* global Larx */
/* global config */
/* global input */

(function() {
	let renderTarget = document.getElementById('viewport');
	let defaultShader, waterShader, mouseShader, cursorShader, shadowShader;
	let settings = new Settings();
	let ui, gameLoop, cursor, mousePicker;
	let useShadows = false;
	
	let models = {
		terrain: undefined,
		water: undefined,
		decorations: undefined,
		smallDecorations: undefined
	};
	
	initSettings()
		.then(initEngine)
		.then(initCamera)
		.then(initShaders)
		.then(initTerrain)
		.then(initWater)
		.then(initDecorations)
		.then(initSmallDecorations)
		.then(initCursors)
		.then(function() {
			gameLoop.start();
			mousePicker = new LarxMousePicker(models.terrain, 10);
			
			switch(settings.values.shadowQuality) {
				case 1: 
					Larx.Shadows.init(11, shadowShader);
					useShadows = true;
					break;
				case 2:
					Larx.Shadows.init(12, shadowShader);
					useShadows = true;
					break;
				case 3:
					Larx.Shadows.init(13, shadowShader);
					useShadows = true;
					break;
			}
			
			setInterval(function() {
				document.getElementById('fps').innerHTML = 
					'FPS: ' + gameLoop.fps + ' ' +
					'AVG: ' + gameLoop.averageFps;
			}, 1000);
		})
		.catch(function(err) { console.error(err); });
		
	 function initShaders() {
		return new Promise((resolve, reject) => {
			defaultShader = new LarxDefaultShader();
			waterShader = new LarxWaterShader();
			mouseShader = new LarxMouseShader();
			cursorShader = new LarxCursorShader();
			shadowShader = new LarxShadowShader();
			
			Promise.all([
				defaultShader.load(),
				waterShader.load(),
				mouseShader.load(),
				cursorShader.load(),
				shadowShader.load()
			]).then(function() {
				defaultShader.use();
				defaultShader.setFog(config.fog.density, config.fog.gradient, config.fog.color);
				defaultShader.cleanUp();
				
				waterShader.use();
				waterShader.setFog(config.fog.density, config.fog.gradient, config.fog.color);
				waterShader.setNearFarPlane(5.0, config.viewDistance)
				waterShader.setWaterColor(config.water.color);
				waterShader.setDistortion(config.water.distortion);
				waterShader.setEdgeWhitening(config.water.edgeWhitening);
				waterShader.setEdgeSoftening(config.water.edgeSoftening);
				waterShader.setDensity(config.water.density);
				waterShader.cleanUp();
				
				resolve();
			}).catch(function (e) { 
				alert(e.message);
				console.error(e);
				reject();
			});
		});      
	}
	
	function initSettings() {
		settings.loadSettings();
		
		switch(settings.values.waterDetail) {
			case 0:
				config.water.quality = 3;
				config.water.detail = 9;
				break;
			case 1:
				config.water.quality = 6;
				config.water.detail = 10;
				break;
			case 2:
				config.water.quality = 7;
				config.water.detail = 11;
				break;
		}
		
		
		config.fog.density = 1.0 / settings.values.viewDistance;
		config.viewDistance = settings.values.viewDistance;
		
		return Promise.resolve();
	}
	
	function initEngine() {
		Larx.init(renderTarget, settings.values.renderMode);
		Larx.setClearColor(config.clearColor);
		Larx.Matrix.farPlane = settings.values.viewDistance;
		
		gameLoop = new LarxGameLoop(doLogic, render);
	
		ui = new UI();
		return Promise.resolve();
	}
	
	function initCamera() {
		Larx.Camera.zoomLevel = config.camera.default.zoom;
		Larx.Camera.rot = config.camera.default.rotation;
		Larx.Camera.look = config.camera.default.look;
		
		return Promise.resolve();
	}
	
	function initCursors() {
		cursor = new LarxCursor(models.terrain);
		cursor.color = config.mouse.colors.default;
		cursor.model.setBounds();
		
		return Promise.resolve();
	}
	
	function initTerrain() {
		return new Promise((resolve, reject) => {
			models.terrain = new LarxTerrain(config.mapScale);
			models.terrain.generate(config.terrain.path, config.terrain.elevation, config.terrain.waterLevel)              
				.then(function(t) {
					models.terrain.setLightSettings(config.terrain.shininess, config.terrain.specularWeight);
					resolve();
				})
				.catch(function(e) { 
					console.error(e); 
					reject();
				});
		});
	}

	function initWater() {
		return new Promise((resolve, reject) => {
			var res = Math.pow(2, config.water.detail);
			
			models.water = new LarxWater();
			
			models.water.refraction = new LarxFramebuffer(res, res);
			models.water.refraction.buildColorBuffer(Larx.gl.UNSIGNED_BYTE);
			models.water.refraction.buildDepthBuffer();
			
			models.water.reflection = new LarxFramebuffer(res, res);
			models.water.reflection.buildColorBuffer(Larx.gl.UNSIGNED_BYTE);
			
			models.water.waveHeight = config.water.waveHeight;
			models.water.speed = config.water.speed;
			
			models.water.generate(models.terrain, config.water.quality, config.water.fps)
				.then(function(w) {
					resolve();
				})
				.catch(function(e) { 
					console.error(e); 
					reject();
				});
		});
	}
	
	function getRandomCoords() {
		var x = Math.random() * models.terrain.getSize();
		var z = Math.random() * models.terrain.getSize();
		  
		return [x, z];
	}
	
	function initDecorations() {
		return new Promise((resolve, reject) => {
			models.decorations = new LarxDecorations(models.terrain);
			
			Promise.all(config.decorations.map(initDecor)).then(function (result) {
				for(var i in result) {
					var count = 0;
					var decor = result[i].decor;
					var model = result[i].model;
					
					while(count < decor.count) {
						var coords = getRandomCoords();
						var added = 
							models.decorations.push(model, coords, true, decor.scale, decor.yLimits, decor.tiltToTerrain, decor.tiltLimit);
							
						if(added) { count++; }
					}                    
				}
				
				models.decorations.bind();
				resolve();
			})
			.catch(function(e) { 
				console.error(e); 
				reject();
			});
		});
	}
	
	function initSmallDecorations() {
		return new Promise((resolve, reject) => {
			models.smallDecorations = new LarxDecorations(models.terrain, config.smallDecorationFadeOut);
			
			Promise.all(config.smallDecorations.map(initDecor)).then(function (result) {
				for(var i in result) {
					var count = 0;
					var decor = result[i].decor;
					var model = result[i].model;
					
					while(count < decor.count) {
						var coords = getRandomCoords();
						var added = 
							models.smallDecorations.push(model, coords, true, decor.scale, decor.yLimits, decor.tiltToTerrain, decor.tiltLimit);
							
						if(added) { count++; }
					}                    
				}
				
				models.smallDecorations.bind();
				resolve();
			})
			.catch(function(e) { 
				console.error(e); 
				reject();
			});
		});
	}
	
	function initDecor(decor) {
		return new Promise((resolve) => {
			var model = new LarxModel();
			model.load(decor.model).then(() => resolve({ decor: decor, model: model }));
		});
	}
   
	function doLogic(delta) {
		mousePicker.updateMouse();
		input.update(mousePicker);
		
		models.water.update(delta);
		Larx.Camera.update(delta);
	}
	
	function render() {
		
		function renderWaterReflection() {
			if(settings.values.waterReflection == 0) { return; }
			
			var matrix = Larx.Camera.getInvertedMatrix();
			
			Larx.Matrix.setIdentity(matrix);
			Larx.Matrix.setUniforms(defaultShader);
			
			defaultShader.setClipPlane(defaultShader.clip.ABOVE, config.water.waveHeight);  
			
			models.water.reflection.bind(true);  
			models.terrain.render(defaultShader, models.terrain.clip.BOTTOM, models.terrain.reflect.YES);
			models.decorations.render(defaultShader, models.decorations.flags.reflect);
			models.water.reflection.unbind();  
		}
		
		function renderWaterRefraction() {
			if(settings.values.waterRefraction == 0) { return; }
			
			defaultShader.setClipPlane(defaultShader.clip.BELOW, -config.water.waveHeight);  
			
			models.water.refraction.bind(true);
			models.terrain.render(defaultShader, models.terrain.clip.TOP, models.terrain.reflect.NO);
			models.decorations.render(defaultShader, models.decorations.flags.refract);
			models.water.reflection.unbind();  
		}
		
		function renderShadowMap() {
			if(!useShadows) {
				return;
			}
			
			Larx.Shadows.bind();
			Larx.Shadows.update(Larx.Camera.zoomLevel * 2.8);
			models.decorations.render(Larx.Shadows.shader);
			
			Larx.Shadows.unbind();
		}
		
		Larx.render(
			function() {            
				Larx.clear();
				
				renderShadowMap();
				
				defaultShader.use(); 
				defaultShader.enableFog(true);
				
				Larx.Matrix.setIdentity(Larx.Camera.getMatrix());                
				Larx.Matrix.setUniforms(defaultShader);
				
				if(useShadows) {
					Larx.Shadows.enable(defaultShader);
				}
				
				models.terrain.render(defaultShader, models.terrain.clip.BOTTOM, models.terrain.reflect.NO);
				
				Larx.gl.enable(Larx.gl.BLEND);
				models.smallDecorations.render(defaultShader);
				defaultShader.cleanUp();
				
				if(useShadows) {
					Larx.Shadows.disable(defaultShader);
					Larx.Shadows.shader.cleanUp();
				}
				
				cursorShader.use();
				cursor.render(cursorShader, mousePicker.getCoordinates());
				
				defaultShader.use(); 
				Larx.Matrix.setUniforms(defaultShader);
				
				Larx.gl.disable(Larx.gl.BLEND);
				
				models.decorations.render(defaultShader);
				
				
				defaultShader.enableFog(false);
				
				renderWaterRefraction();
				renderWaterReflection();
				
				defaultShader.cleanUp();   
				
				Larx.gl.enable(Larx.gl.BLEND);
				
				waterShader.use();
				Larx.Matrix.setIdentity(Larx.Camera.getMatrix());
				Larx.Matrix.setUniforms(waterShader);
				
				models.water.render(waterShader);
				waterShader.cleanUp();
				
							
				Larx.gl.disable(Larx.gl.BLEND);
				
				mouseShader.use();
				mousePicker.render(mouseShader);
			}
		);
	}
})();