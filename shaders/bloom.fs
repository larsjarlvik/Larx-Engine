precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uResolution;

varying vec2 vTexCoords;

void main(void) {
	vec3 col = texture2D(uTexture, vTexCoords).rgb;
	float factor = col.r + col.g + col.b;
	
	if(factor > 2.4) {
		gl_FragColor = vec4(col, 1.0);
	} else {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	}
}