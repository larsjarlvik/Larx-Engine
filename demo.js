/* global Terrain */
/* global MouseShader */
/* global WaterShader */
/* global DefaultShader */
/* global Q */

(function() {
    var renderTarget = document.getElementById('viewport');
    var infoBox = document.getElementById('info');
    
    var viewport = new Viewport(renderTarget);
    var larx = new Larx(viewport);
    var gameLoop = new GameLoop(60);
    var mousePicker = new MousePicker(larx, 0.5);
    var cursor = new Cursor(larx);
    var selectionCursor = new Cursor(larx);
    var pickObjects = [];
    var depthBuffer;
    
    var defaultShader, waterShader, mouseShader, cursorShader, depthShader, skyShader;

    var mTrees, mObjects, mSky, mWater, mTerrain;
    var waterColor = [0.195, 0.805, 0.723];

    initShaders()
        .then(initCursors)
        .then(initTerrain)
        .then(initSky)
        .then(initWater)
        .then(initTrees)
        .then(initObjects)
        .then(function() {
            gameLoop.start(doLogic, render);
        })
        .catch(function(err) {
            console.error(err);
        });

    function initShaders() {
        var deferred = Q.defer();
        
        defaultShader = new DefaultShader(larx);
        waterShader = new WaterShader(larx);
        mouseShader = new MouseShader(larx);
        cursorShader = new CursorShader(larx);
        depthShader = new DepthShader(larx);
        skyShader = new SkyShader(larx);
        
        Q.all([
            defaultShader.load(),
            waterShader.load(),
            mouseShader.load(),
            cursorShader.load(),
            depthShader.load(),
            skyShader.load()
        ]).then(function() {
            skyShader.use();
            skyShader.setColorStop1([0.601, 0.816, 0.820]);
            skyShader.setColorStop2([0.601, 0.816, 0.820]);
            skyShader.setColorStop3([0.250, 0.406, 0.488]);
            skyShader.cleanUp();
                    
            defaultShader.use();
            defaultShader.setFog(0.006, 8.0, [0.601, 0.816, 0.820]);
            defaultShader.cleanUp();
            
            waterShader.use();
            waterShader.setFog(0.006, 8.0, [0.601, 0.816, 0.820]);
            waterShader.setWaterColor(waterColor);
            waterShader.cleanUp();
            
            deferred.resolve();
        }).catch(function (e) { 
            console.error(e);
            deferred.reject();
        });
        
        return deferred.promise;         
    }
    
    function initCursors() {
        cursor.color = [1.0, 1.0, 1.0];
        selectionCursor.color = [0.0, 1.0, 0.0];
        return Q(true);
    }
    
    function initSky() {
        var deferred = Q.defer();
        
        mSky = new Sky(larx, 700);
        mSky.load('skydome').then(function () {
            deferred.resolve();
        });
        
        return deferred.promise;
    }

    function initTerrain() {
        var deferred = Q.defer();
        
        mTerrain = new Terrain(larx);
        mTerrain.generate('/maps/test', 8.0, 1.5, 1)              
            .then(function(t) {
                mTerrain.colors = undefined;
                mTerrain.normals = undefined;
                mTerrain.shininess = 4.0;
                mTerrain.specularWeight = 0.35;  
                
                deferred.resolve(true);
            })
            .catch(function(e) { console.error(e); });
        
        depthBuffer = new Framebuffer(larx, 1024, 1024);
        depthBuffer.buildColorBuffer(larx.gl.UNSIGNED_BYTE, true);
        depthBuffer.buildDepthBuffer();
            
        return deferred.promise;
    }

    function initWater() {
        var quality = 40;
        var deferred = Q.defer();
        
        mWater = new Water(larx, gameLoop);
        mWater.generate(mTerrain, quality).then(function(w) {
            deferred.resolve(true);
        })
        .catch(function(e) { console.error(e); });
        
        return deferred.promise;
    }

    function initTrees() {
        var deferred = Q.defer();
        var model = new Model(larx, 'tree');
                    
        model.load().then(function() {
            var count = 0;
            var bounds = (mTerrain.size / 2) - 2;
            mTrees = new Model(larx, 'trees');
                        
            while(count < 800) {
                var tree = model.clone();
                var x = Math.random() * (mTerrain.size - 2) - ((mTerrain.size - 2) / 2);
                var z = Math.random() * (mTerrain.size - 2) - ((mTerrain.size - 2) / 2);
                var y = mTerrain.getElevationAtPoint(x, z) - 0.02;
                
                var tx = (Math.random() - 0.5) * Math.PI / 12.0;
                var ty = (Math.random() - 0.5) * Math.PI / 12.0;
                
                if(y >= 1.0 && y < 4.0 && x > -bounds && x < bounds && z > -bounds && z < bounds) {
                    tree.rotate([tx, Math.random() * Math.PI, ty]);
                    tree.translate([x, y, z]);
                    
                    mTrees.push(tree);
                    count++;
                }
            }
            
            mTrees.shininess = 1.0;
            mTrees.specularWeight = 1.0;
            mTrees.bindBuffers();
            
            deferred.resolve(true);
        })
        .catch(function(e) { console.error(e); });
        
        return deferred.promise;
    }


    function initObjects() {
        var deferred = Q.defer();
        var models = [
            new Model(larx, 'rock-1'),
            new Model(larx, 'rock-2'),
            new Model(larx, 'crate')
        ];
        
        Q.all([models[0].load(), models[1].load(), models[2].load()]).then(function() {
            var count = 0;
            var bounds = (mTerrain.size / 2) - 2;
            mObjects = new Model(larx, 'objects');
            
            while(count < 550) {
                var object = models[Math.floor(Math.random() * models.length)].clone();
                var x = Math.random() * (mTerrain.size - 2) - ((mTerrain.size - 2) / 2);
                var z = Math.random() * (mTerrain.size - 2) - ((mTerrain.size - 2) / 2);
                var y = mTerrain.getElevationAtPoint(x, z);
                
                if(y >= -2.0 && y < 3.5 && x > -bounds && x < bounds && z > -bounds && z < bounds) {
                    if(object.name !== 'crate') { object.scale(Math.random() * 1.5 + 0.5); }
                    var size = object.getSize();
                    
                    object.rotate([0, Math.random() * Math.PI, 0]);
                    
                    var angle = mTerrain.getAngle(x, z, size[0], size[1]);
                    
                    object.rotate(angle);
                    object.translate([x, y, z]);
                    object.pickId = count;
                    
                    var pickObject = {
                        id: count,
                        type: object.name,
                        pos: [x, y, z],
                        size: size
                    };
                    
                    mousePicker.addObject(object, pickObject.id);
                    pickObjects.push(pickObject);
                    
                    mObjects.push(object);
                    count ++;
                }
            }
            
            mObjects.shininess = 1.0;
            mObjects.specularWeight = 0.7;
            mObjects.bindBuffers();
            deferred.resolve(true);
        })
        .catch(function(e) { console.error(e); });
        
        return deferred.promise;
    }
        
    setInterval(function() {
        document.getElementById('fps').innerHTML = 
            'FPS: ' + gameLoop.fps +
            '   AVG/MIN: ' + gameLoop.averageFpsMinute;
    }, 1000);
    
    function doLogic(time) {
        keyboard();
        mouse();
        
        mWater.update();
    }
    
    function render() {
        var cursorPos, cursorSize, cursorObject, pickObject;
        
        function drawCursor() {
            cursorObject = mousePicker.getObjectId();
            
            if(cursorObject) {
                pickObject = pickObjects.filter(function (obj) { return obj.id == cursorObject })[0];
                cursorPos = pickObject.pos;
                cursorSize = pickObject.size;
                cursor.color = [1.0, 1.0, 0.0];
            } else {
                cursorPos = mousePicker.getCoordinates();
                cursorSize = [0.5, 0.0, 0.5];
                cursor.color = [1.0, 1.0, 1.0];
            }
            
            cursorShader.use();
            cursor.render(cursorShader, mTerrain, cursorPos, cursorSize);
            
            if(selectionCursor) {
                selectionCursor.render(cursorShader, mTerrain, selectionCursor.pos, selectionCursor.size);
            }
            
            cursorShader.cleanUp();
        }
    
        larx.render(function() {            
            larx.clear();
                        
            skyShader.use();
            mSky.render(skyShader);
            skyShader.cleanUp();
            
            depthBuffer.bind();
            defaultShader.use();
            mTerrain.render(defaultShader);
            mObjects.render(defaultShader);
            defaultShader.cleanUp();
            depthBuffer.unbind();
            
            mouseShader.use();
            mousePicker.render(mouseShader, mTerrain);
            
            
            defaultShader.use();
            mTerrain.render(defaultShader);
            defaultShader.cleanUp();
            
            drawCursor();
            
            defaultShader.use();
            mTrees.render(defaultShader);
            mObjects.render(defaultShader);
            defaultShader.cleanUp();
            
            
            waterShader.use();
            mWater.render(waterShader, depthBuffer);
            waterShader.cleanUp();
            
        });
    }

    function keyboard() {
        if(viewport.keyDown('W')) { larx.camera.move( 0.0,  0.5); }
        if(viewport.keyDown('S')) { larx.camera.move( 0.0, -0.5); }
        if(viewport.keyDown('A')) { larx.camera.move(-0.5,  0.0); }
        if(viewport.keyDown('D')) { larx.camera.move( 0.5,  0.0); }
    }


    var dX, dY, cMatrix, dYRad, coords, id, pickObject;
    function mouse() {
        mousePicker.updateMouse(viewport.mouse.x, viewport.mouse.y);
        
        if(viewport.mouse.buttons.right || viewport.mouse.touchDown) {  
            dX = viewport.mouse.deltaX / 3.0;
            dY = viewport.mouse.deltaY / 3.0;
                
            cMatrix = larx.camera.getMatrix();
            dYRad = dY * Math.PI / 180;
            
            larx.camera.rotate(dX, 0);
            
            if(dYRad > 0) {
                if(cMatrix.rotV + dYRad < Math.PI - 0.2) { larx.camera.rotate(0, dY); }
            } else {
                if(cMatrix.rotV + dYRad > 0.2) { larx.camera.rotate(0, dY); }
            }
        }
        
        if(viewport.mouse.buttons.left) {
            coords = mousePicker.getCoordinates(viewport.mouse.x, viewport.mouse.y);
            infoBox.style.display = 'none';
            
            if(coords) {
                infoBox.innerHTML = 'Coordinates, x: ' + coords[0].toFixed(2) + ' y: ' + coords[1].toFixed(2) + ' z: ' + coords[2].toFixed(2);
                infoBox.style.display = 'block';
            }
                        
            id = mousePicker.getObjectId(viewport.mouse.x, viewport.mouse.y);
            if(id) {
                pickObject = pickObjects.filter(function (obj) { return obj.id == id })[0];
                
                infoBox.innerHTML = 'Selected: ' + pickObject.type + ' (ID: ' + pickObject.id + ')<br/>' + 'Size: ' + pickObject.size[0].toFixed(2) + ',' + pickObject.size[2].toFixed(2);
                infoBox.style.display = 'block';
                
                selectionCursor.show = true;
                selectionCursor.pos = pickObject.pos;
                selectionCursor.size = pickObject.size;
            } else {
                selectionCursor.show = false;
            }
        }
        
        if(viewport.mouse.wheelDelta !== 0) {
            larx.camera.zoom(-viewport.mouse.wheelDelta * 2);
        }
        
        viewport.resetDelta();
    }

    document.getElementById('fullscreen').onclick = function() {
        viewport.toggleFullscreen();
    };
    
})();