
var GameLoop = (function () {
    
    function GameLoop() { }
    
    var fps;
    var timeAtLastFrame = new Date().getTime();
    var leftover = 0.0;
    var frames = 0;
    
    var lc, rc;

    function tick() {
        var idealTimePerFrame = 1000 / fps;
        var timeAtThisFrame = new Date().getTime();
        var timeSinceLastDoLogic = (timeAtThisFrame - timeAtLastFrame) + leftover;
        var catchUpFrameCount = Math.floor(timeSinceLastDoLogic / idealTimePerFrame);

        for(var i = 0 ; i < catchUpFrameCount; i++){
            lc(new Date().getTime());
            frames++;
        }

        rc();

        leftover = timeSinceLastDoLogic - (catchUpFrameCount * idealTimePerFrame);
        timeAtLastFrame = timeAtThisFrame;
    }
    
    GameLoop.prototype.start = function (framesPerSecond, logicCallback, renderCallback) {
        fps = framesPerSecond;
        lc = logicCallback;
        rc = renderCallback;
        
        setInterval(tick, 1000 / fps);
    };
    
    return GameLoop;

})();