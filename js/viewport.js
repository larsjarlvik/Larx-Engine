
var Viewport = (function () {

    function Viewport() {
        this._viewport = document.getElementById('viewport');
        setViewportSize.call(this);
    }

    function setViewportSize() {
        var width = this._viewport.offsetWidth;
        var height = Math.round(width / 16 * 9);
        
        this._viewport.setAttribute('width', width);
        this._viewport.setAttribute('height', height);
    }

    Viewport.prototype.get = function () {
        return this._viewport;
    };


    return Viewport;
})();

