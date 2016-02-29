
var Viewport = function (viewport) {
    this.viewport = viewport;
    this.canvas = viewport.getElementsByClassName('renderTarget')[0];
    
    this.mouse = { 
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
    
    this.pressedKeys = [];
    this.resizeCallback;
    
    this._init();
};

Viewport.prototype._init = function() {
    var self = this;
    
    this.viewport.oncontextmenu = function (event) {
        event.preventDefault();
    }
    
    this.setViewportSize();
    
    document.addEventListener('keydown', function (e) { self._keyDown(e); });
    document.addEventListener('keyup', function (e) { self._keyUp(e); });
    
    this.viewport.addEventListener('mousedown', function (e) { self._mouseDown(e); });
    this.viewport.addEventListener('mouseup', function (e) { self._mouseUp(e); });
    this.viewport.addEventListener('mousemove', function (e) { self._mouseMove(e); });
    this.viewport.addEventListener('mousewheel', function (e) { self._mouseWheel(e); });
    this.viewport.addEventListener('DOMMouseScroll', function (e) { self._mouseWheel(e); });
    
    this.viewport.addEventListener('touchstart', function (e) { self._touchStart(e) });
    this.viewport.addEventListener('touchend', function (e) { self._touchEnd(e) });
    this.viewport.addEventListener('touchmove', function (e) { self._touchMove(e) });
    
    window.addEventListener('resize',  function () { self.setViewportSize() });
};
   
Viewport.prototype.setViewportSize = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    
    if(Math.round(width / 16 * 9) > height) {
        width = Math.round(height / 9 * 16);
    } else {
        height = Math.round(width / 16 * 9);
    }
    
    this.canvas.setAttribute('width', width * window.devicePixelRatio);
    this.canvas.setAttribute('height', height * window.devicePixelRatio);
    
    this.canvas.style.width  = width  + "px";
    this.canvas.style.height = height + "px";
    
    if(this.resizeCallback) { this.resizeCallback(); }
};
    
Viewport.prototype._keyDown = function(event) {
    this.pressedKeys[event.keyCode] = true;
};
    
Viewport.prototype._keyUp = function(event) {
    this.pressedKeys[event.keyCode] = false;
};
    
Viewport.prototype._mouseDown = function(event) {
    console.log(event)
    switch(event.button) {
        case 0: this.mouse.buttons.left = true; break;
        case 1: this.mouse.buttons.middle = true; break;
        case 2: this.mouse.buttons.right = true; break;
    }
    
    event.preventDefault();
    return false;
};
    
Viewport.prototype._mouseUp = function(event) {
    switch(event.button) {
        case 0: this.mouse.buttons.left = false; break;
        case 1: this.mouse.buttons.middle = false; break;
        case 2: this.mouse.buttons.right = false; break;
    }
    
    event.preventDefault();
    return false;
};
    
Viewport.prototype._mouseMove = function(event) {    
    var cx = event.layerX * devicePixelRatio,
        cy = event.layerY * devicePixelRatio;
    
    this.mouse.deltaX += cx - this.mouse.x;
    this.mouse.deltaY += cy - this.mouse.y;
    
    this.mouse.x = cx;
    this.mouse.y = cy;
    
    event.preventDefault();
    return false;
};
    
Viewport.prototype._mouseWheel = function(event) {
    var delta = event.wheelDelta ? event.wheelDelta : -event.detail;
    
    if(delta > 0) {
        this.mouse.wheelDelta ++;
    } 
    else if(delta < 0) {
        this.mouse.wheelDelta --;
    }
};
    
Viewport.prototype._touchStart = function(event) {
    this.mouse.x = event.touches[0].clientX;
    this.mouse.y = event.touches[0].clientY;
    this.mouse.touchDown = true;
};
    
Viewport.prototype._touchEnd = function(event) {
    this.mouse.touchDown = false;
};
    
Viewport.prototype._touchMove = function(event) {
    this.mouse.deltaX += event.touches[0].clientX - this.mouse.x;
    this.mouse.deltaY += event.touches[0].clientY - this.mouse.y;
    
    this.mouse.x = event.touches[0].clientX;
    this.mouse.y = event.touches[0].clientY;
};
    
Viewport.prototype.resize = function (callback) {
    this.resizeCallback = callback;
};

Viewport.prototype.keyDown = function (char) {
    return this.pressedKeys[char.charCodeAt(0)] === true;
};

Viewport.prototype.resetDelta = function () {
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mouse.wheelDelta = 0;
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
