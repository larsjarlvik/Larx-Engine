
var Viewport = (function () {

    var _viewport, _canvas;
    var _pressedKeys = [];
    var _resizeCallback;
    
    var _mouse = { 
        buttons: {
            left: false, 
            middle: false, 
            right: false,
        },
        touchDown: false,
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0,
        wheelDelta: 0
    };

    function Viewport() {
        _viewport = document.getElementById('viewport');
        _canvas = _viewport.getElementsByClassName('renderTarget')[0];
        
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
        
        document.addEventListener('touchstart', touchStart);
        document.addEventListener('touchend', touchEnd);
        document.addEventListener('touchmove', touchMove);
        
        window.addEventListener('resize', setViewportSize);
    }

    function setViewportSize() {
        var width = _viewport.offsetWidth;
        var height = Math.round(width / 16 * 9);
        
        _canvas.setAttribute('width', width * window.devicePixelRatio);
        _canvas.setAttribute('height', height * window.devicePixelRatio);
        
        _canvas.style.width  = width  + "px";
        _canvas.style.height = height + "px";
        
        
        if(_resizeCallback) { _resizeCallback(); }
        
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
    
    function touchStart(event) {
        _mouse.x = event.touches[0].screenX;
        _mouse.y = event.touches[0].screenY;
        _mouse.touchDown = true;
    }
    
    function touchEnd(event) {
        _mouse.touchDown = false;
    }
    
    function touchMove(event) {
        _mouse.deltaX += event.touches[0].screenX - _mouse.x;
        _mouse.deltaY += event.touches[0].screenY - _mouse.y;
        
        _mouse.x = event.touches[0].screenX;
        _mouse.y = event.touches[0].screenY;
    }
    
    Viewport.prototype.resize = function (callback) {
        _resizeCallback = callback;
    };
    

    Viewport.prototype.getCanvas = function () {
        return _canvas;
    };
    
    Viewport.prototype.keyDown = function (char) {
        return _pressedKeys[char.charCodeAt(0)] === true;
    };
    
    Viewport.prototype.resetDelta = function () {
        _mouse.deltaX = 0;
        _mouse.deltaY = 0;
        _mouse.wheelDelta = 0;
    };
    
    Viewport.prototype.toggleFullscreen = function () {
        if (!document.fullscreenElement && 
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement) {  
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };
    
    Viewport.prototype.mouse = _mouse;


    return Viewport;
})();

