"use strict";

class LarxViewport {
    
    constructor(viewport) {
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
        this.viewport.oncontextmenu = (event) => event.preventDefault();
        
        this.setViewportSize();
        
        window.addEventListener('resize',  () => this.setViewportSize());
        document.addEventListener('keydown', (event) => this.pressedKeys[event.keyCode] = true);
        document.addEventListener('keyup', (event) => this.pressedKeys[event.keyCode] = false);

        this.canvas.addEventListener('mousedown', (event) => {
            switch(event.button) {
                case 0: this.mouse.buttons.left = true; break;
                case 1: this.mouse.buttons.middle = true; break;
                case 2: this.mouse.buttons.right = true; break;
            }
            
            event.preventDefault();
            return false;
        });
        
        this.canvas.addEventListener('mouseup', (event) => {
            switch(event.button) {
                case 0: this.mouse.buttons.left = false; break;
                case 1: this.mouse.buttons.middle = false; break;
                case 2: this.mouse.buttons.right = false; break;
            }
            
            event.preventDefault();
            return false;
        });
            
        this.canvas.addEventListener('mousemove', (event) => {    
            var cx = event.layerX * devicePixelRatio,
                cy = event.layerY * devicePixelRatio;
                    
            this.mouse.deltaX += cx - this.mouse.x;
            this.mouse.deltaY += cy - this.mouse.y;
            
            this.mouse.x = cx;
            this.mouse.y = cy;
            
            event.preventDefault();
            return false;
        });
            
        let mouseScroll = (event) => {
            var delta = event.wheelDelta ? event.wheelDelta : -event.detail;
            if(delta > 0) {
                this.mouse.wheelDelta ++;
            } else if(delta < 0) {
                this.mouse.wheelDelta --;
            }
        };
            
        this.canvas.addEventListener('mousewheel', (event) => mouseScroll(event));
        this.canvas.addEventListener('DOMMouseScroll', (event) => mouseScroll(event));
         
        this.canvas.addEventListener('touchstart', (event) => {
            this.mouse.x = event.touches[0].clientX;
            this.mouse.y = event.touches[0].clientY;
            this.mouse.touchDown = true;
        });
        
        this.canvas.addEventListener('touchend', () => this.mouse.touchDown = false);
        this.canvas.addEventListener('touchmove', (event) => {
            this.mouse.deltaX += event.touches[0].clientX - this.mouse.x;
            this.mouse.deltaY += event.touches[0].clientY - this.mouse.y;
            
            this.mouse.x = event.touches[0].clientX;
            this.mouse.y = event.touches[0].clientY;
        });
    }
    
    onResize(callback) {
        this.resizeCallbacks.push(callback);
    }
    
    setViewportSize() {
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
    }
    
    resize(callback) {
        this.resizeCallback = callback;
    }
    
    keyDown(char) {
        return this.pressedKeys[char.charCodeAt(0)] === true;
    }
    
    resetDelta() {
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.mouse.wheelDelta = 0;
    }
    
    toggleFullscreen() {
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
