
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
                models.terrain.model.shininess = config.terrain.shininess;
                models.terrain.model.specularWeight = config.terrain.specularWeight;  
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
        var d = config.water.detail;
        
        models.water = new Water(larx, gameLoop);
        
        models.water.refraction = new Framebuffer(larx, larx.gl.viewportWidth * d, larx.gl.viewportHeight * d);
        models.water.refraction.buildColorBuffer(larx.gl.UNSIGNED_BYTE, true);
        models.water.refraction.buildDepthBuffer();
        
        models.water.reflection = new Framebuffer(larx, larx.gl.viewportWidth * d, larx.gl.viewportHeight * d);
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
        var x = Math.random() * (models.terrain.getSize() - 2) - ((models.terrain.getSize() - 2) / 2);
        var z = Math.random() * (models.terrain.getSize() - 2) - ((models.terrain.getSize() - 2) / 2);
          
        var y = models.terrain.getElevationAtPoint(x, z);
        return [x, y, z];
    }
    
    function testBounds(coords, yLimits) {
        var bounds = ((models.terrain.size - 4) * models.terrain.scale) / 2;
        
        return (
            coords[1] >= yLimits[0] * models.terrain.scale && 
            coords[1] <= yLimits[1] * models.terrain.scale && 
            coords[0] > -bounds && coords[0] < bounds && 
            coords[2] > -bounds && coords[2] < bounds);
    }
    
    function initDecorations() {
        var deferred = Q.defer();
        var inits = [];
        
        models.decorations = [];
        models.decorations.push(new Model(larx, 'decorations'));
        
        for(var i in config.decorations) {
            inits.push(initDecor(config.decorations[i]));
        }
        
        Q.all(inits).then(function (result) {
            for(var i in result) {
                var count = 0;
                var decor = result[i].decor;
                
                while(count < decor.count) {
                    var m = result[i].model.clone();
                    var coords = getRandomCoords();
                    var rotation = [0.0, 0.0, 0.0];
                    var size = m.getSize();
                    
                    rotation[1] = Math.random() * Math.PI;
                    
                    if(decor.tiltToTerrain) {
                        rotation = models.terrain.getAngle(coords[0], coords[2], size[0], size[1]);
                    }
                    
                    if(decor.tiltLimit > 0.0) {
                        rotation[0] += (Math.random() - 0.5) * Math.PI / decor.tiltLimit;
                        rotation[2] += (Math.random() - 0.5) * Math.PI / decor.tiltLimit;
                    } 
                    
                    if(testBounds(coords, decor.yLimits)) {
                        m.rotate(rotation);
                        m.scale(Math.random() * (decor.scale[1] - decor.scale[0]) + decor.scale[0]);
                        
                        m.translate(coords);
                        
                        if(decor.selectable) {
                            mousePicker.addObject(m.getBounds(), {
                                size: size,
                                position: coords,
                                description: decor.description
                            });
                        }
                        
                        if(models.decorations[models.decorations.length - 1].indices.length > 65000) {
                            models.decorations.push(new Model(larx, 'decorations'));
                        }
                        
                        models.decorations[models.decorations.length - 1].push(m);
                        count++;
                    }                    
                }
            }
            
            for(var n = 0; n < models.decorations.length; n++) {
                models.decorations[n].shininess = 1.0;
                models.decorations[n].specularWeight = 1.0;
                models.decorations[n].bindBuffers();
            }
            
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
            larx.matrix.setIdentity(true);   
            
            
            models.water.reflection.bind();            
            models.terrain.render(defaultShader);
            for(var i = 0; i < models.decorations.length; i++) {
                models.decorations[i].render(defaultShader);
            }
            
            models.water.reflection.unbind();
            larx.setClearColor(config.clearColor);
            defaultShader.setClipPlane(0, 0); 
        }
        
        function renderWaterRefraction() {
            defaultShader.setClipPlane(defaultShader.clip.below, -models.water.waveHeight);  
            
            larx.matrix.setIdentity();      
            
            models.water.refraction.bind();
            models.terrain.render(defaultShader);
            drawCursor();
              
            defaultShader.use(); 
            for(var i = 0; i < models.decorations.length; i++) {
                models.decorations[i].render(defaultShader);
            }
            
            models.water.refraction.unbind(); 
            defaultShader.setClipPlane(0, 0); 
        }
        
        larx.render(function() {            
            larx.clear();
                        
            mouseShader.use();
            mousePicker.render(mouseShader, models.terrain);
            
            defaultShader.use(); 
            models.terrain.render(defaultShader);
            defaultShader.cleanUp();
            
            drawCursor();
            
            defaultShader.use();
            for(var i = 0; i < models.decorations.length; i++) {
                models.decorations[i].render(defaultShader);
            }
            
            renderWaterReflection();
            renderWaterRefraction();
            
            defaultShader.cleanUp();    
            
            waterShader.use();
            models.water.render(waterShader);
            waterShader.cleanUp();
        });
    }
})();