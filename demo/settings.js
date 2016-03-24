'use strict';

class Settings {
	constructor() {
	}
	
	storeSettings() {
		window.localStorage.setItem('settings', JSON.stringify(this.values));
	}
	
	loadSettings() {
		var values = window.localStorage.settings;

		if(!values) {
			this.loadDefaultSettings();
		} else {
			this.values = JSON.parse(values);
		}
	}
	
	loadDefaultSettings() {
		this.values = {
			renderMode: Larx.RENDER_MODES.FXAA,
			viewDistance: 500,
			shadowQuality: 2,
			waterDetail: 1,
			waterReflection: 1,
			waterRefraction: 1
		};
	}
}