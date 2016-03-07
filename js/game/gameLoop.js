
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
            leftover = 0.0,
            timeSinceLastDoLogic ,
            catchUpFrameCount;
        
        
        function tick() {
            timeAtThisFrame = new Date().getTime();
            timeSinceLastDoLogic = (timeAtThisFrame - timeAtLastFrame) + leftover;
            catchUpFrameCount = Math.floor(timeSinceLastDoLogic / idealTimePerFrame);
            
            for(var i = 0 ; i < catchUpFrameCount && i < 180; i++){
                self.logicCallback(new Date().getTime());
            }
            
            requestAnimationFrame(function() {
                self.renderCallback()
                currentFps ++;
            });
            
            leftover = timeSinceLastDoLogic - (catchUpFrameCount * idealTimePerFrame);
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

    