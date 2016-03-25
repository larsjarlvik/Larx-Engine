attribute vec3 aVertexPosition;
varying vec2 vTexCoords;
uniform vec2 uResolution;

// FXAA
uniform bool uEnableFXAAVS;
varying vec2 vResolution;
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

void fxaa() {
	vec2 fragCoord = vTexCoords * uResolution;
	vec2 inverseVP = 1.0 / uResolution.xy;
	v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
	v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
	v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
	v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
	v_rgbM = vec2(fragCoord * inverseVP);
}

// MAIN
void main(void) {
	vTexCoords = (aVertexPosition.xy + 1.0) * 0.5;
	vResolution = uResolution;
	
	if(uEnableFXAAVS) { fxaa(); }
	
	gl_Position = vec4(aVertexPosition, 1.0);
}