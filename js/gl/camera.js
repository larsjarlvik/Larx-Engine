

var Camera = function () {
    this.zoomLevel = 75,
    this.look = { x: -20, y: 0, z: -20 },
    this.rot = { v: 35, h: 45 }
};

Camera.prototype._calcPos = function() {
    var v = this._degToRad(this.rot.v),
        h = this._degToRad(this.rot.h);
    
    var vec = {
        z: this.look.z - (this.zoomLevel * Math.cos(v) * Math.cos(h)),
        x: this.look.x - (this.zoomLevel * Math.cos(v) * Math.sin(h)),
        y: this.zoomLevel * Math.sin(v)
    }
    
    return vec;
};

Camera.prototype._degToRad = function (degrees) {
    return degrees * Math.PI / 180;
};

Camera.prototype.getMatrix = function () {
    var pos = this._calcPos();
    
    return {
        rotV: this._degToRad(this.rot.v),
        rotH: this._degToRad(this.rot.h),
        x: -pos.x,
        y: -pos.y, 
        z: pos.z
    };
};

Camera.prototype.move = function (xDelta, zDelta) {
    var h = this._degToRad(this.rot.h);
    
    this.look.z += zDelta * Math.cos(h);
    this.look.x += zDelta * Math.sin(h);
    
    this.look.z += xDelta * Math.cos(h + Math.PI / 2);
    this.look.x += xDelta * Math.sin(h + Math.PI / 2);
};

Camera.prototype.rotate = function (hDelta, vDelta) {
    this.rot.h += hDelta;
    this.rot.v += vDelta;
};

Camera.prototype.zoom = function (zoomDelta) {
    this.zoomLevel += zoomDelta;
};
