/* global mat4 */
/* global Q */

var Engine = (function () {
    var _gl, _viewport, 
        _shaders, _camera, _matrix, _model;
        
    var _renderCallback, _initCallback;
    
    Engine.prototype = {
        get: function() {
            return {
                shaders: _shaders, 
                matrix: _matrix,
                camera: _camera,
                model: _model
            }; 
        },
        render: function(callback) {
            _renderCallback = callback;
        },
        init: function(callback) {
            _initCallback = callback;
        }
    };
    
    function Engine(viewport) {
        _viewport = viewport;
              
        Q(true)
          .then(initGL)
          .then(initShaders)
          .then(initSettings)
          .then(function () {
              console.log('ENGINE: Init');
              
              var deferred = Q.defer();
              
              _initCallback(deferred).then(function () {
                  console.log('ENGINE: Render');
                  render();
              });
          })
          .catch(function(e) {
              console.log(e);
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
            
            _model = new Model(_gl);
        } catch(e) {
            return Q.reject(e); // TODO: Error handling
        }
        
        if(!_gl){
            return Q.reject('Could not initialize Web_gl!');
        }
        
        return Q(true);
    }
    
    function initShaders() {
        console.log('ENGINE: Shaders');
        
        var deferred = Q.defer();
        
        _shaders = new Shaders(_gl);
        _shaders.initShaders().then(function (shaderProgram) {   
            deferred.resolve();
        });
        
        return deferred.promise;
    }
    
    
    function initSettings() {
        console.log('ENGINE: Settings');
        
        _gl.clearColor(1.0, 1.0, 1.0, 1.0);
        _gl.enable(_gl.DEPTH_TEST);
        
        _camera = new Camera();
        _matrix = new Matrix(_gl, _camera);
        
        return Q(true);
    }
    
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    function render() {    
        
        _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
        
        _matrix.setIdentity(_gl);
        _matrix.push();
        
        _renderCallback();
        
        _matrix.pop();
        
        requestAnimationFrame(render);
    }

    return Engine;
})();

