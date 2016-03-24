precision mediump float;
varying vec3 vVertexPosition;

void main(void) {
	gl_FragColor = vec4(vVertexPosition, 1.0);
}