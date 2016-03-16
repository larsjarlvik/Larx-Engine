var input = (function() {
    var coords, sObject;
    var dX, dY, cMatrix, dYRad;
    var infoBox = document.getElementById('info');
    var fullScreenButton = document.getElementById('fullscreen');
    
    function keyboard() {
        if(Larx.Viewport.keyDown('W')) { Larx.Camera.smoothMove( 0.0,  config.camera.moveSpeed); }
        if(Larx.Viewport.keyDown('S')) { Larx.Camera.smoothMove( 0.0, -config.camera.moveSpeed); }
        if(Larx.Viewport.keyDown('A')) { Larx.Camera.smoothMove(-config.camera.moveSpeed,  0.0); }
        if(Larx.Viewport.keyDown('D')) { Larx.Camera.smoothMove( config.camera.moveSpeed,  0.0); }
    }

    function mouse(mousePicker) {
        if(Larx.Viewport.mouse.buttons.right || Larx.Viewport.mouse.touchDown) {  
            dX = Larx.Viewport.mouse.deltaX * config.camera.rotationSpeed;
            dY = Larx.Viewport.mouse.deltaY * config.camera.rotationSpeed;
                
            cMatrix = Larx.Camera.getMatrix();
            dYRad = dY * Math.PI / 180;
            
            Larx.Camera.smoothRotateH(dX);
            Larx.Camera.smoothRotateV(dY);
        }
        
        if(Larx.Viewport.mouse.wheelDelta !== 0) {
            Larx.Camera.smoothZoom(-Larx.Viewport.mouse.wheelDelta * config.camera.zoomSpeed);
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
        update: function(mousePicker) {
            keyboard();
            mouse(mousePicker);
        },
        worldCoords: coords,
        getSelectedObject: function() {
            return sObject;
        }
    };   
    
})();