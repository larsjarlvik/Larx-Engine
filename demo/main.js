/* global Larx */
/* global config */
/* global input */

(function() {
    var renderTarget = document.getElementById('viewport');
    var defaultShader, waterShader, mouseShader, cursorShader;
    var cursor;
    
    Larx.init(renderTarget, Larx.RENDER_MODES.FXAA);
    Larx.setClearColor(config.clearColor);
    
    var gameLoop = new LarxGameLoop(doLogic, render, config.targetFps);
    var mousePicker = new LarxMousePicker(10);
    
    
    input.init();
    
    var models = {
        terrain: undefined,
        water: undefined,
        decorations: undefined
    };
    
    initCamera()
        .then(initShaders)
        .then(initTerrain)
        .then(initWater)
        .then(initDecorations)
        .then(initCursors)
        .then(function() {
            gameLoop.start();
            
            setInterval(function() {
                document.getElementById('fps').innerHTML = 
                    'FPS: ' + gameLoop.fps + ' ' +
                    'AVG: ' + gameLoop.averageFpsMinute;
            }, 1000);
        })
        .catch(function(err) { console.error(err); });
        
     function initShaders() {
        return new Promise((resolve, reject) => {
            defaultShader = new LarxDefaultShader();
            waterShader = new LarxWaterShader();
            mouseShader = new LarxMouseShader();
            cursorShader = new LarxCursorShader();
            
            Promise.all([
                defaultShader.load(),
                waterShader.load(),
                mouseShader.load(),
                cursorShader.load()
            ]).then(function() {
                defaultShader.use();
                defaultShader.setFog(config.fog.density, config.fog.gradient, config.fog.color);
                defaultShader.cleanUp();
                
                waterShader.use();
                waterShader.setFog(config.fog.density, config.fog.gradient, config.fog.color);
                waterShader.setWaterColor(config.water.color);
                waterShader.setDistortion(config.water.distortion);
                waterShader.setEdgeWhitening(config.water.edgeWhitening);
                waterShader.setEdgeSoftening(config.water.edgeSoftening);
                waterShader.setDensity(config.water.density);
                waterShader.cleanUp();
                
                resolve();
            }).catch(function (e) { 
                console.error(e);
                reject();
            });
        });      
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
            
            models.water.generate(models.terrain, config.water.quality, config.targetFps)
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
    
    function initDecor(decor) {
        return new Promise((resolve) => {
            var model = new LarxModel();
            model.load(decor.model).then(() => resolve({ decor: decor, model: model }));
        });
    }
   
    function doLogic(time) {
        mousePicker.updateMouse();
        input.update(mousePicker);
        Larx.Camera.update(time);
        models.water.update();
    }
    
    function render() {
        
        function renderWaterReflection() {
            Larx.Matrix.setIdentity(true);
            Larx.Matrix.setUniforms(defaultShader);
            
            defaultShader.setClipPlane(defaultShader.clip.ABOVE, config.water.waveHeight);  
            
            Larx.setClearColor(config.water.reflectionColor);
            
            models.water.reflection.bind(true);  
            models.terrain.render(defaultShader, models.terrain.clip.BOTTOM, models.terrain.reflect.YES);
            models.decorations.render(defaultShader, models.decorations.flags.reflect);
            models.water.reflection.unbind();  
            
            Larx.setClearColor(config.clearColor);
        }
        
        function renderWaterRefraction() {
            defaultShader.setClipPlane(defaultShader.clip.BELOW, -config.water.waveHeight);  
            
            models.water.refraction.bind(true);
            models.terrain.render(defaultShader, models.terrain.clip.TOP, models.terrain.reflect.NO);
            models.decorations.render(defaultShader, models.decorations.flags.refract);
            models.water.reflection.unbind();  
        }
        
        Larx.render(
            function() {            
                Larx.clear();
                
                defaultShader.use(); 
                defaultShader.useFog(true);
                
                Larx.Matrix.setIdentity();
                Larx.Matrix.setUniforms(defaultShader);
                models.terrain.render(defaultShader, models.terrain.clip.BOTTOM, models.terrain.reflect.NO);
                Larx.Matrix.setUniforms(defaultShader);
                models.decorations.render(defaultShader);
                
                defaultShader.useFog(false);
                
                renderWaterRefraction();
                renderWaterReflection();
                
                defaultShader.cleanUp();   
                
                Larx.gl.enable(Larx.gl.BLEND);
                
                waterShader.use();
                Larx.Matrix.setIdentity();
                Larx.Matrix.setUniforms(waterShader);
                
                models.water.render(waterShader);
                waterShader.cleanUp();
                
                cursorShader.use();
                cursor.render(cursorShader, mousePicker.getCoordinates());
                            
                Larx.gl.disable(Larx.gl.BLEND);
                
                mouseShader.use();
                mousePicker.render(mouseShader, models.terrain);
            }
        );
    }
})();