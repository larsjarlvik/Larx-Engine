attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying float vTextureY;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

void main(void) {
	vTextureY = aTextureCoord.y;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}