/* global Q */

var Engine = (function () {
    var _gl, _viewport, _camera, _matrix, _model;
        
    Engine.prototype = {
        get: function() {
            return {
                matrix: _matrix,
                camera: _camera,
                model: _model,
                gl: _gl
            }; 
        }
    };
    
    function Engine(viewport, initCallback) {
        _viewport = viewport;
              
        Q(true)
          .then(initGL)
          .then(initSettings)
          .then(function () {
              console.log('ENGINE: Init Complete');
              initCallback();
          })
          .catch(function(e) {
              console.error(e);
          })
          .done();
    }

    function initGL() {
        console.log('ENGINE: Init');
        
        try {
            var canvas = _viewport.getCanvas();
            
            _gl = canvas.getContext('webgl');
            _gl.viewportWidth = canvas.width;
            _gl.viewportHeight = canvas.height;
            
            _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
            _gl.enable(_gl.BLEND);
            _gl.disable(_gl.DEPTH_TEST);
            
            _viewport.resize(function () {
                var canvas = _viewport.getCanvas();
                _gl.viewportWidth = canvas.width;
                _gl.viewportHeight = canvas.height;
            });
            
            _model = new Model(_gl);
        } catch(e) {
            return Q.reject(e); // TODO: Error handling
        }
        
        if(!_gl){
            return Q.reject('Could not initialize Web_gl!');
        }
        
        return Q(true);
    }
    
    
    function initSettings() {
        console.log('ENGINE: Settings');
        
        _gl.clearColor(0.0, 0.0, 0.0, 1.0);
        _gl.enable(_gl.DEPTH_TEST);
        
        _camera = new Camera();
        _matrix = new Matrix(_gl, _camera);
        
        return Q(true);
    }
    
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    Engine.prototype.render = function(callback) {  
        _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
        
        _matrix.setIdentity(_gl);
        _matrix.push();
        
        callback();
        
        _matrix.pop();
    };

    return Engine;
})();

