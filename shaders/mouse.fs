precision mediump float;

uniform float uColorId;

varying vec3 vVertexPosition;

void main(void) {
        
    if(uColorId >= 0.0) {
        gl_FragColor = vec4(-1.0, uColorId, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(vVertexPosition.x, vVertexPosition.y, vVertexPosition.z, 1.0);
    }
    
}