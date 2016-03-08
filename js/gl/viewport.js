/* global Larx */

Larx.Viewport = {
    
    init: function (viewport) {
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
        this.resizeCallbacks = [];
        this.viewport.oncontextmenu = function (event) {
            event.preventDefault();
        }
        
        this.setViewportSize();
        
        document.addEventListener('keydown', function (e) { keyDown(e); });
        document.addEventListener('keyup', function (e) { keyUp(e); });
        
        this.canvas.addEventListener('mousedown', function (e) { mouseDown(e); });
        this.canvas.addEventListener('mouseup', function (e) { mouseUp(e); });
        this.canvas.addEventListener('mousemove', function (e) { mouseMove(e); });
        this.canvas.addEventListener('mousewheel', function (e) { mouseWheel(e); });
        this.canvas.addEventListener('DOMMouseScroll', function (e) { mouseWheel(e); });
        
        this.canvas.addEventListener('touchstart', function (e) { touchStart(e) });
        this.canvas.addEventListener('touchend', function (e) { touchEnd(e) });
        this.canvas.addEventListener('touchmove', function (e) { touchMove(e) });
        
        window.addEventListener('resize',  function () { self.setViewportSize() });
        
        var self = this;
        function keyDown(event) {
            self.pressedKeys[event.keyCode] = true;
        }
            
        function keyUp(event) {
            self.pressedKeys[event.keyCode] = false;
        }
        
        function mouseDown(event) {
            switch(event.button) {
                case 0: self.mouse.buttons.left = true; break;
                case 1: self.mouse.buttons.middle = true; break;
                case 2: self.mouse.buttons.right = true; break;
            }
            
            event.preventDefault();
            return false;
        }
        
        function mouseUp(event) {
            switch(event.button) {
                case 0: self.mouse.buttons.left = false; break;
                case 1: self.mouse.buttons.middle = false; break;
                case 2: self.mouse.buttons.right = false; break;
            }
            
            event.preventDefault();
            return false;
        }
            
        function mouseMove(event) {    
            var cx = event.layerX * devicePixelRatio,
                cy = event.layerY * devicePixelRatio;
                    
            self.mouse.deltaX += cx - self.mouse.x;
            self.mouse.deltaY += cy - self.mouse.y;
            
            self.mouse.x = cx;
            self.mouse.y = cy;
            
            event.preventDefault();
            return false;
        }
            
        function mouseWheel(event) {
            var delta = event.wheelDelta ? event.wheelDelta : -event.detail;
            
            if(delta > 0) {
                self.mouse.wheelDelta ++;
            } else if(delta < 0) {
                self.mouse.wheelDelta --;
            }
        }
            
        function touchStart(event) {
            self.mouse.x = event.touches[0].clientX;
            self.mouse.y = event.touches[0].clientY;
            self.mouse.touchDown = true;
        }
            
        function touchEnd(event) {
            self.mouse.touchDown = false;
        }
            
        function touchMove(event) {
            self.mouse.deltaX += event.touches[0].clientX - self.mouse.x;
            self.mouse.deltaY += event.touches[0].clientY - self.mouse.y;
            
            self.mouse.x = event.touches[0].clientX;
            self.mouse.y = event.touches[0].clientY;
        }
    },
    
    onResize: function(callback) {
        this.resizeCallbacks.push(callback);
    },
    
    setViewportSize: function() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        
        if(Math.round(width / 16 * 9) > height) {
            width = Math.round(height / 9 * 16);
        } else {
            height = Math.round(width / 16 * 9);
        }
        
        this.canvas.setAttribute('width', width );
        this.canvas.setAttribute('height', height );
        
        this.canvas.style.width  = width  + "px";
        this.canvas.style.height = height + "px";
        
        for(var i in this.resizeCallbacks) {
            this.resizeCallbacks[i]();
        }
    },
    
    resize: function (callback) {
        this.resizeCallback = callback;
    },
    
    keyDown: function (char) {
        return this.pressedKeys[char.charCodeAt(0)] === true;
    },
    
    resetDelta: function () {
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.mouse.wheelDelta = 0;
    },
    
    toggleFullscreen: function () {
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
    }
};
