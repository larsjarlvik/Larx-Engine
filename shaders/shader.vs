attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

varying vec3 vColor;
varying vec3 vNormal;

varying vec4 vPosition;
varying vec3 vTransformedNormal;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
    
    vNormal = aVertexNormal;
    vTransformedNormal = uNMatrix * aVertexNormal;
    vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
}