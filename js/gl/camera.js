/* global Larx */

Larx.Camera = {
    zoomLevel: 0,
    look: { x: 0, y: 0, z: 0 },
    rot: { v: 0, h: 0 },
    
    calcPos: function(rot, look, zoom) {
        this.v = this.degToRad(rot.v);
        this.h = this.degToRad(rot.h);
        
        return {
            z: look.z - (zoom * Math.cos(this.v) * Math.cos(this.h)),
            x: look.x - (zoom * Math.cos(this.v) * Math.sin(this.h)),
            y: zoom * Math.sin(this.v)
        }
    },
    
    degToRad: function (degrees) {
        return degrees * Math.PI / 180;
    },
    
    getMatrix: function () {
        var pos = this.calcPos(this.rot, this.look, this.zoomLevel);
        
        return {
            rotV: this.degToRad(this.rot.v),
            rotH: this.degToRad(this.rot.h),
            x: -pos.x,
            y: -pos.y, 
            z:  pos.z
        };
    },
    
    getInvertedMatrix: function () {
        var pos = this.calcPos({ v: -this.rot.v, h: this.rot.h }, this.look, this.zoomLevel);
        
        return {
            rotV: this.degToRad(-this.rot.v),
            rotH: this.degToRad(this.rot.h),
            x: -pos.x,
            y: -pos.y, 
            z:  pos.z
        };
    },
    
    move: function (xDelta, zDelta) {
        this.moveH = this.degToRad(this.rot.h);
        
        this.look.z += zDelta * Math.cos(this.moveH);
        this.look.x += zDelta * Math.sin(this.moveH);
        
        this.look.z += xDelta * Math.cos(this.moveH + Math.PI / 2);
        this.look.x += xDelta * Math.sin(this.moveH + Math.PI / 2);
    },
    
    rotate: function (hDelta, vDelta) {
        this.rot.h += hDelta;
        this.rot.v += vDelta;
    },
    
    zoom: function (zoomDelta) {
        this.zoomLevel += zoomDelta;
    }
};
