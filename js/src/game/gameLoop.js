'use strict';

class LarxGameLoop {
	constructor(logicCallback, renderCallback) {
		this.fps = 0;
		this.averageFps = 0;
		this.logicCallback =  logicCallback;
		this.renderCallback = renderCallback;
	}
	
	start() {
		let currentFps = 0;
		let averageFps = 0;
		let timeAtLastFrame = performance.now(),
			timeAtThisFrame = performance.now(),
			timeSinceLastDoLogic;
		
		let self = this;
		function render() {
			timeAtThisFrame = performance.now();
			timeSinceLastDoLogic = (timeAtThisFrame - timeAtLastFrame);
			
			self.logicCallback(timeSinceLastDoLogic);
			self.renderCallback();
			
			requestAnimationFrame(() => render());
			currentFps ++;
			timeAtLastFrame = timeAtThisFrame;
		}
		
		requestAnimationFrame(() => render());
		
		setInterval(() => {
			this.fps = currentFps;
			averageFps += currentFps;
			currentFps = 0;
		}, 1000);
		
		setInterval(() => {
			this.averageFps = (averageFps / 20).toFixed(1);
			averageFps = 0;
		}, 20000);
	}
}

	