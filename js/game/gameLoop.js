
var GameLoop = function(targetFps) {
    this.targetFps = targetFps;
    this.fps = 0;
    this.averageFpsMinute = 0;
    this._currentFps = 0;
    this._averageFps = 0;
    this.timeAtLastFrame = new Date().getTime();
    this.leftover = 0.0;
    
    this.logicCallback;
    this.renderCallback;
    
    this.idealTimePerFrame = 1000 / this.targetFps;
};

GameLoop.prototype._tick = function() {
    
    this.timeAtThisFrame = new Date().getTime();
    this.timeSinceLastDoLogic = (this.timeAtThisFrame - this.timeAtLastFrame) + this.leftover;
    this.catchUpFrameCount = Math.floor(this.timeSinceLastDoLogic / this.idealTimePerFrame);

    for(var i = 0 ; i < this.catchUpFrameCount && i < 180; i++){
        this.logicCallback(new Date().getTime());
    }

    requestAnimationFrame(this.renderCallback);
    
    this.leftover = this.timeSinceLastDoLogic - (this.catchUpFrameCount * this.idealTimePerFrame);
    this.timeAtLastFrame = this.timeAtThisFrame;
    
    this._currentFps ++;
};

GameLoop.prototype.start = function (logicCallback, renderCallback) {
    this.logicCallback = logicCallback;
    this.renderCallback = renderCallback;
    
    var self = this;
    
    setInterval(function() { self._tick(); }, 1000 / this.targetFps);
    setInterval(function() {
        self.fps = self._currentFps;
        self._averageFps += self._currentFps;
        self._currentFps = 0;
    }, 1000);
    
    setInterval(function () {
        self.averageFpsMinute = (self._averageFps / 60).toFixed(1);
        self._averageFps = 0;
    }, 60000);
};
    