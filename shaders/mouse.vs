attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec2 translation;

varying vec4 vVertexPosition;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vVertexPosition = vec4(aVertexPosition, 1.0);
}
