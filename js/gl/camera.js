

var Camera = function () {
    this.zoomLevel = 45,
    this.look = { x: -25, y: 0, z: -25 },
    this.rot = { v: 35, h: 45 }
};

Camera.prototype._calcPos = function() {
    this._v = this._degToRad(this.rot.v);
    this._h = this._degToRad(this.rot.h);
    
    return {
        z: this.look.z - (this.zoomLevel * Math.cos(this._v) * Math.cos(this._h)),
        x: this.look.x - (this.zoomLevel * Math.cos(this._v) * Math.sin(this._h)),
        y: this.zoomLevel * Math.sin(this._v)
    }
};

Camera.prototype._degToRad = function (degrees) {
    return degrees * Math.PI / 180;
};

Camera.prototype.getMatrix = function () {
    this._pos = this._calcPos();
    
    return {
        rotV: this._degToRad(this.rot.v),
        rotH: this._degToRad(this.rot.h),
        x: -this._pos.x,
        y: -this._pos.y, 
        z:  this._pos.z
    };
};

Camera.prototype.move = function (xDelta, zDelta) {
    this._moveH = this._degToRad(this.rot.h);
    
    this.look.z += zDelta * Math.cos(this._moveH);
    this.look.x += zDelta * Math.sin(this._moveH);
    
    this.look.z += xDelta * Math.cos(this._moveH + Math.PI / 2);
    this.look.x += xDelta * Math.sin(this._moveH + Math.PI / 2);
};

Camera.prototype.rotate = function (hDelta, vDelta) {
    this.rot.h += hDelta;
    this.rot.v += vDelta;
};

Camera.prototype.zoom = function (zoomDelta) {
    this.zoomLevel += zoomDelta;
};
