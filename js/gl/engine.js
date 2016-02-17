/* global mat4 */
/* global Q */

var Engine = (function () {
    var s = this;
    
    var _gl, _canvas, _shaders;
    var _matrix;
    var _tree;
    
    function Engine(viewport) {
        _canvas = viewport.get();
              
        Q(true)
          .then(initGL)
          .then(initShaders)
          .then(initSettings)
          .then(loadModels)
          .then(function () {
              console.log('ENGINE: Render');
              render();
          })
          .catch(function(e) {
              console.log(e);
          })
          .done();
    }

    function initGL() {
        console.log('ENGINE: Init');
        
        try {
            _gl = _canvas.getContext('webgl');            
            _gl.viewportWidth = _canvas.width;
            _gl.viewportHeight = _canvas.height;
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
        
        _matrix = new Matrix();
        
        return Q(true);
    }
    
    function loadModels() {
        var deferred = Q.defer();
        
        console.log('ENGINE: Models');
        
        _tree = new Model(_gl, 'tree');
        _tree.load().then(function () {
            deferred.resolve();
        });
        
        return deferred.promise;
    }
    
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    function render() {    
        requestAnimationFrame(render);
        
        _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
        
        var defaultShader = _shaders.get().default;
        
        _matrix.setIdentity(_gl);
        _matrix.push();
        _matrix.setUniforms(_gl, defaultShader)
        _tree.render(defaultShader, _matrix);
        
        _matrix.pop();
    }

    return Engine;
})();

