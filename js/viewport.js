
var Viewport = (function () {

    var _viewport;
    var _pressedKeys = [];

    function Viewport() {
        _viewport = document.getElementById('viewport');
        setViewportSize.call();
        
        document.onkeydown = keyDown;
        document.onkeyup = keyUp;
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

    Viewport.prototype.getCanvas = function () {
        return _viewport;
    };
    
    Viewport.prototype.keyDown = function (char) {
        return _pressedKeys[char.charCodeAt(0)] === true;
    };


    return Viewport;
})();

