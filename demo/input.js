var input = (function() {
    var mousePicker, coords, sObject;
    var dX, dY, cMatrix, dYRad;
    var infoBox = document.getElementById('info');
    var fullScreenButton = document.getElementById('fullscreen');
    
    function keyboard(larx) {
        if(larx.viewport.keyDown('W')) { larx.camera.move( 0.0,  config.camera.moveSpeed); }
        if(larx.viewport.keyDown('S')) { larx.camera.move( 0.0, -config.camera.moveSpeed); }
        if(larx.viewport.keyDown('A')) { larx.camera.move(-config.camera.moveSpeed,  0.0); }
        if(larx.viewport.keyDown('D')) { larx.camera.move( config.camera.moveSpeed,  0.0); }
    }

    function mouse(larx) {
        mousePicker.updateMouse(larx.viewport.mouse.x, larx.viewport.mouse.y);
        
        if(larx.viewport.mouse.buttons.left) {
            coords = mousePicker.getCoordinates(larx.viewport.mouse.x, larx.viewport.mouse.y);
            sObject = mousePicker.getObject(larx.viewport.mouse.x, larx.viewport.mouse.y);
            
            setInfoText();
        }
        
        if(larx.viewport.mouse.buttons.right || larx.viewport.mouse.touchDown) {  
            dX = larx.viewport.mouse.deltaX / 3.0;
            dY = larx.viewport.mouse.deltaY / 3.0;
                
            cMatrix = larx.camera.getMatrix();
            dYRad = dY * Math.PI / 180;
            
            larx.camera.rotate(dX, 0);
            
            if(dYRad > 0) {
                if(cMatrix.rotV + dYRad < Math.PI - 0.2) { larx.camera.rotate(0, dY); }
            } else {
                if(cMatrix.rotV + dYRad > 0.2) { larx.camera.rotate(0, dY); }
            }
        }
        
        if(larx.viewport.mouse.wheelDelta !== 0) {
            larx.camera.zoom(-larx.viewport.mouse.wheelDelta * 2);
        }
        
        larx.viewport.resetDelta();
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
        init: function(larx, mp) {
            mousePicker = mp;
            fullScreenButton.addEventListener('click', function() {
                larx.viewport.toggleFullscreen();
            });
        },
        update: function(larx) {
            keyboard(larx);
            mouse(larx);
        },
        worldCoords: coords,
        getSelectedObject: function() {
            return sObject;
        }
    };   
    
})();