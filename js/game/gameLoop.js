/* global Larx */

Larx.GameLoop = {
    targetFps: 0,
    fps: 0,
    averageFpsMinute: 0,
    logicCallback: undefined,
    renderCallback: undefined,
    
    init: function(logicCallback, renderCallback, targetFps) {
        this.targetFps = targetFps;
        this.logicCallback = logicCallback;
        this.renderCallback = renderCallback;
    },
    
    start: function () {
        var self = this;
        var currentFps = 0;
        var averageFps = 0;
        
        
        var timeAtLastFrame = new Date().getTime(),
            timeAtThisFrame = new Date().getTime(),
            idealTimePerFrame = 1000 / this.targetFps,
            timeSinceLastDoLogic;
        
        
        function tick() {
                timeAtThisFrame = new Date().getTime();
                timeSinceLastDoLogic = (timeAtThisFrame - timeAtLastFrame);
                
                self.logicCallback(timeSinceLastDoLogic);
                self.renderCallback()
                currentFps ++;
                
                timeAtLastFrame = timeAtThisFrame;
        }
        
        setInterval(function() { tick(); }, 1000 / this.targetFps);
        setInterval(function() {
            self.fps = currentFps;
            averageFps += currentFps;
            currentFps = 0;
        }, 1000);
        
        setInterval(function () {
            self.averageFpsMinute = (averageFps / 20).toFixed(1);
            averageFps = 0;
        }, 20000);
    }
};

    