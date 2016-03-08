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
        var deferred = Q.defer();
        
        defaultShader = new LarxDefaultShader();
        waterShader = new LarxWaterShader();
        mouseShader = new LarxMouseShader();
        cursorShader = new LarxCursorShader();
        
        Q.all([
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
            
            deferred.resolve();
        }).catch(function (e) { 
            console.error(e);
            deferred.reject();
        });
        
        return deferred.promise;         
    }
    
    function initCamera() {
        Larx.Camera.zoomLevel = config.camera.default.zoom;
        Larx.Camera.rot = config.camera.default.rotation;
        Larx.Camera.look = config.camera.default.look;
        
        return Q();
    }
    
    function initCursors() {
        cursor = new LarxCursor(models.terrain);
        cursor.color = config.mouse.colors.default;
        
        return Q();
    }
    
    function initTerrain() {
        var deferred = Q.defer();
        
        models.terrain = new LarxTerrain(config.mapScale);
        models.terrain.generate(config.terrain.path, config.terrain.elevation, config.terrain.waterLevel)              
            .then(function(t) {
                models.terrain.setLightSettings(config.terrain.shininess, config.terrain.specularWeight);
                deferred.resolve();
            })
            .catch(function(e) { 
                console.error(e); 
                deferred.reject();
            });
            
        return deferred.promise;
    }

    function initWater() {
        var deferred = Q.defer();
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
                deferred.resolve();
            })
            .catch(function(e) { 
                console.error(e); 
                deferred.reject();
            });
        
        return deferred.promise;
    }
    
    function getRandomCoords() {
        var x = Math.random() * models.terrain.getSize();
        var z = Math.random() * models.terrain.getSize();
          
        return [x, z];
    }
    
    function initDecorations() {
        var deferred = Q.defer();
        var inits = [];
        
        models.decorations = new LarxDecorations(models.terrain);
        
        for(var i in config.decorations) {
            inits.push(initDecor(config.decorations[i]));
        }
        
        Q.all(inits).then(function (result) {
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
            deferred.resolve();
        })
        .catch(function(e) { 
            console.error(e); 
            deferred.reject();
        });
        
        return deferred.promise;
    }
    
    function initDecor(decor) {
        var deferred = Q.defer();
        var model = new LarxModel();
        
        model.load(decor.model).then(function () {
           deferred.resolve({
               decor: decor,
               model: model
           }); 
        });
        
        return deferred.promise;   
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