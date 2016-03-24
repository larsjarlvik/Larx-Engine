precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vVertexPosition;

uniform vec3 uColor;
uniform float uRadius;

void main(void) {
	vec2 m = vTextureCoord - vec2(0.5, 0.5);
	float distance = sqrt(m.x * m.x + m.y * m.y);

	float opacity = (sin(distance * 6.0) * 20.0) - 19.0;
	
	if(opacity == 0.0) discard;

	gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);
}