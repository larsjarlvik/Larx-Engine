
var Viewport = (function () {

    var _viewport;
    var _pressedKeys = [];
    
    var _mouse = { 
        buttons: {
            left: false, 
            middle: false, 
            right: false,
        },
        x: undefined,
        y: undefined,
        deltaX: 0,
        deltaY: 0,
        wheelDelta: 0
    };

    function Viewport() {
        _viewport = document.getElementById('viewport');
        _viewport.oncontextmenu = function (event) {
            event.preventDefault();
        }
        
        setViewportSize.call();
        
        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);
        
        document.addEventListener('mousedown', mouseDown);
        document.addEventListener('mouseup', mouseUp);
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mousewheel', mouseWheel);
        document.addEventListener('DOMMouseScroll', mouseWheel);
        
    }

    function setViewportSize() {
        var width = _viewport.offsetWidth;
        var height = Math.round(width / 16 * 9);
        
        _viewport.setAttribute('width', width);
        _viewport.setAttribute('height', height);
    }
    
    function keyDown(event) {
        _pressedKeys[event.keyCode] = true;
    }
    
    function keyUp(event) {
        _pressedKeys[event.keyCode] = false;
    }
    
    function mouseDown(event) {
        switch(event.button) {
            case 0: _mouse.buttons.left = true; break;
            case 1: _mouse.buttons.middle = true; break;
            case 2: _mouse.buttons.right = true; break;
        }
        
        event.preventDefault();
        return false;
    }
    
    function mouseUp(event) {
        switch(event.button) {
            case 0: _mouse.buttons.left = false; break;
            case 1: _mouse.buttons.middle = false; break;
            case 2: _mouse.buttons.right = false; break;
        }
        
        event.preventDefault();
        return false;
    }
    
    function mouseMove(event) {
        _mouse.deltaX += event.screenX - _mouse.x;
        _mouse.deltaY += event.screenY - _mouse.y;
        
        _mouse.x = event.screenX;
        _mouse.y = event.screenY;
        
        event.preventDefault();
        return false;
    }
    
    function mouseWheel(event) {
        var delta = event.wheelDelta ? event.wheelDelta : -event.detail;
        
        if(delta > 0) {
            _mouse.wheelDelta ++;
        } 
        else if(delta < 0) {
            _mouse.wheelDelta --;
        }
    }

    Viewport.prototype.getCanvas = function () {
        return _viewport;
    };
    
    Viewport.prototype.keyDown = function (char) {
        return _pressedKeys[char.charCodeAt(0)] === true;
    };
    
    Viewport.prototype.resetDelta = function () {
        _mouse.deltaX = 0;
        _mouse.deltaY = 0;
        _mouse.wheelDelta = 0;
    };
    
    Viewport.prototype.mouse = _mouse;


    return Viewport;
})();

