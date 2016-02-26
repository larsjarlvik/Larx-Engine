var Camera = (function () {
    
    var _camera = {
        zoom: 75,
        look: { x: -20, y: 0, z: -20 },
        rot: { v: 35, h:45 }
    }
    
    function Camera() { }
    
    function calcPos() {
        var v = degToRad(_camera.rot.v),
            h = degToRad(_camera.rot.h);
        
        var vec = {
            z: _camera.look.z - (_camera.zoom * Math.cos(v) * Math.cos(h)),
            x: _camera.look.x - (_camera.zoom * Math.cos(v) * Math.sin(h)),
            y: _camera.zoom * Math.sin(v)
        }
        
        return vec;
    }
    
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    Camera.prototype.getMatrix = function () {
        var pos = calcPos();
        
        return {
            rotV: degToRad(_camera.rot.v),
            rotH: degToRad(_camera.rot.h),
            x: -pos.x,
            y: -pos.y, 
            z: pos.z
        };
    };
    
    Camera.prototype.move = function (xDelta, zDelta) {
        var h = degToRad(_camera.rot.h);
        
        _camera.look.z += zDelta * Math.cos(h);
        _camera.look.x += zDelta * Math.sin(h);
        
        _camera.look.z += xDelta * Math.cos(h + Math.PI / 2);
        _camera.look.x += xDelta * Math.sin(h + Math.PI / 2);
    };
    
    Camera.prototype.rotate = function (hDelta, vDelta) {
        _camera.rot.h += hDelta;
        _camera.rot.v += vDelta;
    };
    
    Camera.prototype.zoom = function (zoomDelta) {
        _camera.zoom += zoomDelta;
    };
    
    Camera.prototype.getZoom = function (zoomDelta) {
        return _camera.zoom;
    };
    
    return Camera;
    
})();