"use strict";

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
        
        function tick() {
        }
        
        setInterval(() => {
            timeAtThisFrame = new Date().getTime();
            timeSinceLastDoLogic = (timeAtThisFrame - timeAtLastFrame);
            
            this.logicCallback(timeSinceLastDoLogic);
            this.renderCallback()
            currentFps ++;
            
            timeAtLastFrame = timeAtThisFrame;
        }, 1000 / this.targetFps);
        
        
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

    