
var GameLoop = function(fps) {
    
    this.fps = fps;
    this.timeAtLastFrame = new Date().getTime();
    this.leftover = 0.0;
    this.frames = 0;
    
    this.logicCallback;
    this.renderCallback;
};

GameLoop.prototype._tick = function() {
    var idealTimePerFrame = 1000 / this.fps;
    var timeAtThisFrame = new Date().getTime();
    var timeSinceLastDoLogic = (timeAtThisFrame - this.timeAtLastFrame) + this.leftover;
    var catchUpFrameCount = Math.floor(timeSinceLastDoLogic / idealTimePerFrame);

    for(var i = 0 ; i < catchUpFrameCount; i++){
        this.logicCallback(new Date().getTime(), catchUpFrameCount);
        this.frames++;
    }

    this.renderCallback();
    
    if(catchUpFrameCount > 2) { 
        console.warn('LAG: ' + catchUpFrameCount); 
    }

    this.leftover = timeSinceLastDoLogic - (catchUpFrameCount * idealTimePerFrame);
    this.timeAtLastFrame = timeAtThisFrame;
};

GameLoop.prototype.start = function (logicCallback, renderCallback) {
    this.logicCallback = logicCallback;
    this.renderCallback = renderCallback;
    
    var self = this;
    
    setInterval(function() { self._tick(); }, 1000 / this.fps);
};
    