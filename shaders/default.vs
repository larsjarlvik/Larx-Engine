attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform float uFogDensity;
uniform float uFogGradient;

varying float vVisibility;
varying vec3 vColor;
varying vec3 vNormal;

varying vec4 vPosition;
varying vec3 vTransformedNormal;
varying vec3 vVertexPosition;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
    
    vNormal = aVertexNormal;
    vTransformedNormal = uNMatrix * aVertexNormal;
    vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
    vVertexPosition = aVertexPosition;
    
    float distance = length(gl_Position);
    vVisibility = clamp(exp(-pow((distance * uFogDensity), uFogGradient)), 0.0, 1.0);
}