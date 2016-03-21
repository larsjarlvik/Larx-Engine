'use strict';

class LarxGameLoop {
    constructor(logicCallback, renderCallback, targetFps) {
        this.targetFps = targetFps;
        this.fps = 0;
        this.averageFpsMinute = 0;
        this.logicCallback =  logicCallback;
        this.renderCallback = renderCallback;
    }
    
    start() {
        let currentFps = 0;
        let averageFps = 0;
        let timeAtLastFrame = new Date().getTime(),
            timeAtThisFrame = new Date().getTime(),
            idealTimePerFrame = 1000 / this.targetFps,
            timeSinceLastDoLogic;
        
        let self = this;
        function tick() {
            timeAtThisFrame = new Date().getTime();
            timeSinceLastDoLogic = (timeAtThisFrame - timeAtLastFrame);
            
            self.logicCallback(timeSinceLastDoLogic);
            self.renderCallback()
            currentFps ++;
            
            timeAtLastFrame = timeAtThisFrame;
            
            requestAnimationFrame(() => tick());
        }
        
            requestAnimationFrame(() => tick());
        
        
        setInterval(() => {
            this.fps = currentFps;
            averageFps += currentFps;
            currentFps = 0;
        }, 1000);
        
        setInterval(() => {
            this.averageFpsMinute = (averageFps / 20).toFixed(1);
            averageFps = 0;
        }, 20000);
    }
}

    