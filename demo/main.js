/* global Framebuffer */
/* global CursorShader */
/* global MouseShader */
/* global WaterShader */
/* global Viewport */
/* global config */

(function() {
    var renderTarget = document.getElementById('viewport');
    var viewport = new Viewport(renderTarget);
    var larx = new Larx(viewport, config.clearColor);
    var gameLoop = new GameLoop(config.targetFps);
    var defaultShader, waterShader, mouseShader, cursorShader;
    var cursor, selectionCursor;
    var mousePicker;
    
    var models = {
        terrain: undefined,
        water: undefined,
        decorations: undefined
    };
    
    initCamera()
        .then(initShaders)
        .then(initCursors)
        .then(initTerrain)
        .then(initWater)
        .then(initDecorations)
        .then(function() {
            gameLoop.start(doLogic, render);
            
            setInterval(function() {
                document.getElementById('fps').innerHTML = 'FPS: ' + gameLoop.fps + ' AVG/MIN: ' + gameLoop.averageFpsMinute;
            }, 1000);
        })
        .catch(function(err) { console.error(err); });
        
     function initShaders() {
        var deferred = Q.defer();
        
        defaultShader = new DefaultShader(larx);
        waterShader = new WaterShader(larx);
        mouseShader = new MouseShader(larx);
        cursorShader = new CursorShader(larx);
        
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
        larx.camera.zoomLevel = config.camera.default.zoom;
        larx.camera.rot = config.camera.default.rotation;
        larx.camera.look = config.camera.default.look;
        
        return Q();
    }
    
    function initCursors() {
        cursor = new Cursor(larx);
        selectionCursor = new Cursor(larx);
    
        cursor.color = config.mouse.colors.default;
        selectionCursor.color = config.mouse.colors.selection;
        
        mousePicker = new MousePicker(larx, config.mouse.precision);
        input.init(larx, mousePicker)
        
        return Q();
    }
    
    function initTerrain() {
        var deferred = Q.defer();
        
        models.terrain = new Terrain(larx, config.mapScale);
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
        
        models.water = new Water(larx, gameLoop);
        
        models.water.refraction = new Framebuffer(larx, res, res);
        models.water.refraction.buildColorBuffer(larx.gl.UNSIGNED_BYTE, true);
        models.water.refraction.buildDepthBuffer();
        
        models.water.reflection = new Framebuffer(larx, res, res);
        models.water.reflection.buildColorBuffer(larx.gl.UNSIGNED_BYTE, true);
        
        models.water.waveHeight = config.water.waveHeight;
        models.water.speed = config.water.speed;
        
        models.water.generate(models.terrain, config.water.quality)
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
        
        models.decorations = new Decorations(larx, models.terrain);
        
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
                    
                    
                    /*
                    if(decor.selectable) {
                        mousePicker.addObject(m.bounds, {
                            size: size,
                            position: coords,
                            description: decor.description
                        });
                    }
                    */
                    
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
        var model = new Model(larx, decor.model);
        
        model.load().then(function () {
           deferred.resolve({
               decor: decor,
               model: model
           }); 
        });
        
        return deferred.promise;   
    }
   
    function doLogic(time) {
        input.update(larx);
        models.water.update();
    }
    
    function render() {
        var cursorPos, cursorObject, sObject;
        function drawCursor() {
            cursorPos = mousePicker.getCoordinates();
            cursorObject = mousePicker.getObject();
            sObject = input.getSelectedObject();
            
            cursorShader.use();
                
            if(cursorObject !== undefined) {
                cursor.color = config.mouse.colors.hightlight;
                cursor.render(cursorShader, models.terrain, cursorObject.position, cursorObject.size);
            } else {
                cursor.color = config.mouse.colors.default;
                cursor.render(cursorShader, models.terrain, cursorPos, config.mouse.size);
            }
            
            if(sObject) {
                selectionCursor.render(cursorShader, models.terrain, sObject.position, sObject.size);
            }
            
            cursorShader.cleanUp();
        }
        
        function renderWaterReflection() {
            defaultShader.setClipPlane(defaultShader.clip.above, models.water.waveHeight);  
            
            larx.setClearColor(config.water.reflectionColor);
            
            models.water.reflection.bind();  
            models.terrain.render(defaultShader, models.terrain.flags.reflect);
            models.decorations.render(defaultShader, models.decorations.flags.reflect);
            models.water.reflection.unbind(); 
            
            larx.setClearColor(config.clearColor);
        }
        
        function renderWaterRefraction() {
            defaultShader.setClipPlane(defaultShader.clip.below, -models.water.waveHeight);  
            
            models.water.refraction.bind();
            models.terrain.render(defaultShader, models.terrain.flags.refract);
            models.decorations.render(defaultShader, models.decorations.flags.refract);
            models.water.refraction.unbind(); 
        }
        
        larx.render(function() {            
            larx.clear();
                        
            //mouseShader.use();
            //mousePicker.render(mouseShader, models.terrain);
            
    
            defaultShader.use(); 
            larx.gl.enable(larx.gl.BLEND);
            
            models.terrain.render(defaultShader, models.terrain.flags.default);
            models.decorations.render(defaultShader);
            
            renderWaterReflection();
            renderWaterRefraction();
            
            
            //drawCursor();
            
            //for(var i = 0; i < models.decorations.length; i++) {
                //models.decorations[i].render(defaultShader);
            //}
            defaultShader.cleanUp();    
            
            waterShader.use();
            models.water.render(waterShader);
            waterShader.cleanUp();
            larx.gl.disable(larx.gl.BLEND);
        });
    }
})();