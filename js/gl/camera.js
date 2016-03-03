

var Camera = function () {
    this.zoomLevel = 0,
    this.look = { x: 0, y: 0, z: 0 },
    this.rot = { v: 0, h: 0 }
};

Camera.prototype._calcPos = function(rot, look, zoom) {
    this._v = this._degToRad(rot.v);
    this._h = this._degToRad(rot.h);
    
    return {
        z: look.z - (zoom * Math.cos(this._v) * Math.cos(this._h)),
        x: look.x - (zoom * Math.cos(this._v) * Math.sin(this._h)),
        y: zoom * Math.sin(this._v)
    }
};

Camera.prototype._degToRad = function (degrees) {
    return degrees * Math.PI / 180;
};

Camera.prototype.getMatrix = function () {
    this._pos = this._calcPos(this.rot, this.look, this.zoomLevel);
    
    return {
        rotV: this._degToRad(this.rot.v),
        rotH: this._degToRad(this.rot.h),
        x: -this._pos.x,
        y: -this._pos.y, 
        z:  this._pos.z
    };
};

Camera.prototype.getInvertedMatrix = function () {
    this._pos = this._calcPos({ v: -this.rot.v, h: this.rot.h }, this.look, this.zoomLevel);
    
    return {
        rotV: this._degToRad(-this.rot.v),
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
