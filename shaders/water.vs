attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform float uWaveHeight;
uniform float uWaveTime;

varying vec3 vNormal;
varying vec3 vTransformedNormal;

varying vec4 vPosition;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uMVMatrix * position;
    
    vNormal = aVertexNormal;
    vTransformedNormal = uNMatrix * aVertexNormal;
}
