"use strict";

class LarxCamera  {
    constructor() {
        this.zoomLevel = 0;
        this.look = { x: 0, y: 0, z: 0 };
        this.rot = { v: 0, h: 0 };
        this.speed = { x: 0, z: 0, h: 0, v: 0, zoom: 0 };
        this.deceleration = { zoom: 1, move: 1, rotation: 1.5 };
        this.limits = { zoom: 4.0, move: 4.0 };
    }
    
    calcPos(rot, look, zoom) {
        this.v = this.degToRad(rot.v);
        this.h = this.degToRad(rot.h);
        
        return {
            z: look.z - (zoom * Math.cos(this.v) * Math.cos(this.h)),
            x: look.x - (zoom * Math.cos(this.v) * Math.sin(this.h)),
            y: zoom * Math.sin(this.v)
        }
    }
    
    degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    getMatrix() {
        let pos = this.calcPos(this.rot, this.look, this.zoomLevel);
        
        return {
            rotV: this.degToRad(this.rot.v),
            rotH: this.degToRad(this.rot.h),
            x: -pos.x,
            y: -pos.y, 
            z:  pos.z
        };
    }
    
    getInvertedMatrix() {
        let pos = this.calcPos({ v: -this.rot.v, h: this.rot.h }, this.look, this.zoomLevel);
        
        return {
            rotV: this.degToRad(-this.rot.v),
            rotH: this.degToRad(this.rot.h),
            x: -pos.x,
            y: -pos.y, 
            z:  pos.z
        };
    }
    
    move (xDelta, zDelta) {
        this.moveH = this.degToRad(this.rot.h);
        
        this.look.z += zDelta * Math.cos(this.moveH);
        this.look.x += zDelta * Math.sin(this.moveH);
        
        this.look.z += xDelta * Math.cos(this.moveH + Math.PI / 2);
        this.look.x += xDelta * Math.sin(this.moveH + Math.PI / 2);
    }
    
    rotate(hDelta, vDelta) {
        this.rot.h += hDelta;
        this.rot.v += vDelta;
    }
    
    zoom(zoomDelta) {
        this.zoomLevel += zoomDelta;
    }
    
    smoothMove(xSpeed, zSpeed) {
        this.speed.x += xSpeed;
        this.speed.z += zSpeed;
        
        if(this.speed.x >  this.limits.move) { this.speed.x =  this.limits.move; }
        if(this.speed.x < -this.limits.move) { this.speed.x = -this.limits.move; }
        
        if(this.speed.z >  this.limits.move) { this.speed.z =  this.limits.move; }
        if(this.speed.z < -this.limits.move) { this.speed.z = -this.limits.move; }
    }
    
    smoothRotateH(hSpeed) {
        this.speed.h += hSpeed;
    }
    
    smoothRotateV(vSpeed) {
        this.speed.v += vSpeed;
    }
    
    smoothZoom(zoomSpeed) {
        this.speed.zoom += zoomSpeed;
        
        if(this.speed.zoom >  this.limits.zoom) { this.speed.zoom =  this.limits.zoom; }
        if(this.speed.zoom < -this.limits.zoom) { this.speed.zoom = -this.limits.zoom; }
    }
    
    update(time) {
        this.move((this.speed.x / 10) * time, (this.speed.z / 10) * time);
        this.rotate((this.speed.h / 100) * time, (this.speed.v / 100) * time);
        this.zoom(this.speed.zoom * time);
        
        this.speed.x /= (time * (this.deceleration.move / 100)) + 1;
        this.speed.z /= (time * (this.deceleration.move / 100)) + 1;
        
        this.speed.h /= (time * (this.deceleration.rotation / 100)) + 1;
        this.speed.v /= (time * (this.deceleration.rotation / 100)) + 1;
        
        this.speed.zoom /= (time * (this.deceleration.zoom / 100)) + 1;
    }
}
