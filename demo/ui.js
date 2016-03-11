"use strict";

class UI {
    constructor() {
        this.fullscreenButton = document.getElementById('fullscreenButton');
        this.settingsButton = document.getElementById('settingsButton');
        this.infoButton = document.getElementById('infoButton');
        this.closeInfoButton = document.getElementById('closeInfoButton');
        this.closeSettingsButton = document.getElementById('closeSettingsButton');
        this.applySettingsButton = document.getElementById('applySettingsButton');
        this.topBar = document.getElementById('topBar');
        
        window.addEventListener('resize', () => this.setFontSize());
        
        this.infoOverlay = document.getElementById('infoOverlay');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        
        this.settings = new Settings();
        
        this.renderModeSetting = document.getElementById('renderModeSetting');
        this.viewDistanceSetting = document.getElementById('viewDistanceSetting');
        this.waterDetailSetting = document.getElementById('waterDetailSetting');
        this.waterReflectionSetting = document.getElementById('waterReflectionSetting');
        this.waterRefractionSetting = document.getElementById('waterRefractionSetting');
        
        
        this.setFontSize();
        this.initEvents();
    }
    
    initEvents() {
        this.fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
        this.settingsButton.addEventListener('click', () => this.showSettings());
        this.infoButton.addEventListener('click', () => this.setOverlayVisibility(this.infoOverlay, true));
        
        this.closeInfoButton.addEventListener('click', () => this.setOverlayVisibility(this.infoOverlay, false));
        this.closeSettingsButton.addEventListener('click', () => this.setOverlayVisibility(this.settingsOverlay, false));
        
        this.applySettingsButton.addEventListener('click', () => this.applySettings());
    }
    
    setFontSize() {
        let fontSize = Larx.Viewport.canvas.height / 50;
        document.body.style.fontSize = fontSize + 'px';
    }
    
    toggleFullscreen() {
        
        Larx.Viewport.toggleFullscreen();
    }
    
    showSettings() {
        this.setOverlayVisibility(this.settingsOverlay, true);
        this.settings.loadSettings();
        
        let settings = this.settings.values;
        
        this.renderModeSetting.value = settings.renderMode;
        this.viewDistanceSetting.value = settings.viewDistance;
        this.waterDetailSetting.value = settings.waterDetail;
        this.waterReflectionSetting.value = settings.waterReflection;
        this.waterRefractionSetting.value = settings.waterRefraction;
    }
    
    applySettings() {
        let settings = this.settings.values;
        
        settings.renderMode = parseInt(this.renderModeSetting.value);
        settings.viewDistance = parseInt(this.viewDistanceSetting.value);
        settings.waterDetail = parseInt(this.waterDetailSetting.value);
        settings.waterReflection = parseInt(this.waterReflectionSetting.value);
        settings.waterRefraction = parseInt(this.waterRefractionSetting.value);
        
        this.settings.storeSettings();
        
        location.reload();
    }
    
    setOverlayVisibility(element, visible) {
        if(visible) {
            element.className = element.className.replace('hide', 'show');
            this.topBar.className += ' hidden';
        } else {
            element.className = element.className.replace('show', '');
            this.topBar.className = this.topBar.className.replace('hidden', '');
            
            setTimeout(() => {
                element.className += ' hide';
            }, 400);
        }
    }
}