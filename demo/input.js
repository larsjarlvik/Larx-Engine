var input = (function() {
    var coords, sObject;
    var dX, dY, cMatrix, dYRad;
    var infoBox = document.getElementById('info');
    var fullScreenButton = document.getElementById('fullscreen');
    
    function keyboard() {
        if(Larx.Viewport.keyDown('W')) { Larx.Camera.move( 0.0,  config.camera.moveSpeed); }
        if(Larx.Viewport.keyDown('S')) { Larx.Camera.move( 0.0, -config.camera.moveSpeed); }
        if(Larx.Viewport.keyDown('A')) { Larx.Camera.move(-config.camera.moveSpeed,  0.0); }
        if(Larx.Viewport.keyDown('D')) { Larx.Camera.move( config.camera.moveSpeed,  0.0); }
    }

    function mouse() {
        /*
        Larx.MousePicker.updateMouse(Larx.Viewport.mouse.x, Larx.Viewport.mouse.y);
        if(Larx.Viewport.mouse.buttons.left) {
            coords = mousePicker.getCoordinates(Larx.Viewport.mouse.x, Larx.Viewport.mouse.y);
            sObject = mousePicker.getObject(Larx.Viewport.mouse.x, Larx.Viewport.mouse.y);
            
            setInfoText();
        }
        */
        
        if(Larx.Viewport.mouse.buttons.right || Larx.Viewport.mouse.touchDown) {  
            dX = Larx.Viewport.mouse.deltaX * config.camera.rotationSpeed;
            dY = Larx.Viewport.mouse.deltaY * config.camera.rotationSpeed;
                
            cMatrix = Larx.Camera.getMatrix();
            dYRad = dY * Math.PI / 180;
            
            Larx.Camera.rotate(dX, 0);
            
            if(dYRad > 0) {
                if(cMatrix.rotV + dYRad < Math.PI - 0.3) { Larx.Camera.rotate(0, dY); }
            } else {
                if(cMatrix.rotV + dYRad > 0.3) { Larx.Camera.rotate(0, dY); }
            }
        }
        
        if(Larx.Viewport.mouse.wheelDelta !== 0) {
            Larx.Camera.zoom(-Larx.Viewport.mouse.wheelDelta * config.camera.zoomSpeed);
        }
        
        Larx.Viewport.resetDelta();
    }
    
    function setInfoText(params) {
        if(coords) {
            infoBox.innerHTML = 'Coordinates, x: ' + coords[0].toFixed(2) + ' y: ' + coords[1].toFixed(2) + ' z: ' + coords[2].toFixed(2);
            infoBox.style.display = 'block';
        }
                        
        if(sObject) {
            infoBox.innerHTML = 'Selected: ' + sObject.description;
            infoBox.style.display = 'block';
        }
    }
    
    return {
        init: function() {
            console.log(fullScreenButton);
            fullScreenButton.addEventListener('click', function() {
                console.log('he')
                Larx.Viewport.toggleFullscreen();
            });
        },
        update: function() {
            keyboard();
            mouse();
        },
        worldCoords: coords,
        getSelectedObject: function() {
            return sObject;
        }
    };   
    
})();