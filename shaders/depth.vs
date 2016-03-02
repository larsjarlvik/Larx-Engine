attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

varying vec3 vColor;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec3 vTransformedNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

void main(void) {
    float vertexY = aVertexPosition.y;
    
    vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * vPosition;
    vColor = aVertexColor;
    
    vNormal = aVertexNormal;
    vTransformedNormal = uNMatrix * aVertexNormal;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.x, vertexY, aVertexPosition.z, 1.0);    
}