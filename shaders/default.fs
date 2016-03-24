precision mediump float;

varying vec3 vColor;
varying vec3 vVertexPosition;
varying float vFogIntensity;
varying vec3 vLightWeighting;
varying vec4 vShadowCoords;
varying float vEnableShadows;
varying float vVisibility;

uniform vec3 uFogColor;

uniform int uClipPlane;
uniform float uClipPlaneLevel;

uniform sampler2D uShadowMapTexture;
uniform float uShadowMapResolution;

const int CLIP_ABOVE = 1;
const int CLIP_BELOW = 2;

const float PCF_COUNT = 1.0;
const float PCF_SAMLE_SIZE = 0.5;


float getShadowFactor() {
	if(vShadowCoords.z > 1.0 || vEnableShadows == 0.0) {
		return 1.0;
	}
	
	float totalTexels = (PCF_COUNT * 2.0 + PCF_SAMLE_SIZE) * (PCF_COUNT * 2.0 + PCF_SAMLE_SIZE);
	float texelSize = 1.0 / uShadowMapResolution;
	float total = 0.0;
	
	for(float x = -PCF_COUNT; x <= PCF_COUNT; x += PCF_SAMLE_SIZE) {
		for(float y = -PCF_COUNT; y <= PCF_COUNT; y += PCF_SAMLE_SIZE) {
			float nearestLight = texture2D(uShadowMapTexture, vShadowCoords.xy + vec2(x, y) * texelSize).r;
			if(vShadowCoords.z > nearestLight) {
				total += 0.2;
			}
		}
	}
	
	total /= totalTexels;
	
	return 1.0 - (total * vShadowCoords.w);
}

void main(void) {
	if(uClipPlane == CLIP_ABOVE && vVertexPosition.y < -uClipPlaneLevel) discard;
	if(uClipPlane == CLIP_BELOW && vVertexPosition.y > -uClipPlaneLevel) discard;   
	
	gl_FragColor = vec4((vColor * vLightWeighting), vVisibility);
	gl_FragColor*= getShadowFactor();
	gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vFogIntensity), gl_FragColor.w);
}