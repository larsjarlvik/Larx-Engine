attribute vec3 aVertexPosition;

varying vec2 vTexCoords;

void main(void) {
	vTexCoords = (aVertexPosition.xy + 1.0) * 0.5;	
	gl_Position = vec4(aVertexPosition, 1.0);
}