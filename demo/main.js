/* global Framebuffer */
/* global CursorShader */
/* global MouseShader */
/* global WaterShader */
/* global Viewport */
/* global config */

(function() {
    var renderTarget = document.getElementById('viewport');
    var defaultShader, waterShader, mouseShader, cursorShader;
    var cursor, selectionCursor;
    
    Larx.init(renderTarget);
    Larx.setClearColor(config.clearColor);
    Larx.GameLoop.init(doLogic, render, config.targetFps);
    
    input.init();
    
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
            Larx.GameLoop.start();
            
            setInterval(function() {
                document.getElementById('fps').innerHTML = 
                    'FPS: ' + Larx.GameLoop.fps + ' ' +
                    'AVG/MIN: ' + Larx.GameLoop.averageFpsMinute;
            }, 1000);
        })
        .catch(function(err) { console.error(err); });
        
     function initShaders() {
        var deferred = Q.defer();
        
        defaultShader = new Larx.DefaultShader();
        waterShader = new Larx.WaterShader();
        mouseShader = new Larx.MouseShader();
        cursorShader = new Larx.CursorShader();
        
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
        cursor = new Larx.Cursor();
        selectionCursor = new Larx.Cursor();
    
        cursor.color = config.mouse.colors.default;
        selectionCursor.color = config.mouse.colors.selection;
        
        return Q();
    }
    
    function initTerrain() {
        var deferred = Q.defer();
        
        models.terrain = new Larx.Terrain(config.mapScale);
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
        
        models.water = new Larx.Water();
        
        models.water.refraction = new Larx.Framebuffer(res, res);
        models.water.refraction.buildColorBuffer(Larx.gl.UNSIGNED_BYTE, true);
        models.water.refraction.buildDepthBuffer();
        
        models.water.reflection = new Larx.Framebuffer(res, res);
        models.water.reflection.buildColorBuffer(Larx.gl.UNSIGNED_BYTE, true);
        
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
        
        models.decorations = new Larx.Decorations(models.terrain);
        
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
        var model = new Larx.Model();
        
        model.load(decor.model).then(function () {
           deferred.resolve({
               decor: decor,
               model: model
           }); 
        });
        
        return deferred.promise;   
    }
   
    function doLogic(time) {
        input.update();
        models.water.update();
    }
    
    function render() {
        var cursorPos, cursorObject, sObject;
        
        function drawCursor() {
            cursorPos = Larx.MousePicker.getCoordinates();
            cursorObject = Larx.MousePicker.getObject();
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
            
            Larx.setClearColor(config.water.reflectionColor);
            
            models.water.reflection.bind();  
            models.terrain.render(defaultShader, models.terrain.clip.BOTTOM, models.terrain.reflect.YES);
            models.decorations.render(defaultShader, models.decorations.flags.reflect);
            models.water.reflection.unbind(); 
            
            Larx.setClearColor(config.clearColor);
        }
        
        function renderWaterRefraction() {
            defaultShader.setClipPlane(defaultShader.clip.below, -models.water.waveHeight);  
            
            models.water.refraction.bind();
            models.terrain.render(defaultShader, models.terrain.clip.TOP, models.terrain.reflect.NO);
            models.decorations.render(defaultShader, models.decorations.flags.refract);
            models.water.refraction.unbind(); 
        }
        
        Larx.render(function() {            
            Larx.clear();
            defaultShader.use(); 
            
            models.decorations.render(defaultShader);
            models.terrain.render(defaultShader, models.terrain.clip.BOTTOM, models.terrain.reflect.NO);
            
            renderWaterReflection();
            renderWaterRefraction();
            
            defaultShader.cleanUp();   
            
            Larx.gl.enable(Larx.gl.BLEND);
            
            waterShader.use();
            models.water.render(waterShader);
            waterShader.cleanUp();
            
            Larx.gl.disable(Larx.gl.BLEND);
        });
    }
})();