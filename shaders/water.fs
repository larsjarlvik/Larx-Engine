precision mediump float;

varying vec4 vPosition;
varying float vVisibility;
varying vec3 vLightWeighting;
varying vec3 vNormal;
varying vec2 vRefractTexCoords;
varying vec4 vClipSpace;

uniform vec3 uColor;
uniform vec3 uFogColor;
uniform float uDistortion;

uniform sampler2D uRefractionDepthTexture;
uniform sampler2D uRefractionColorTexture;
uniform sampler2D uReflectionColorTexture;

uniform float uWaterDensity;
uniform float uEdgeSoftening;
uniform float uEdgeWhitening;

uniform float uFarPlane;
uniform float uNearPlane;

void main(void) {
	// Depth
	vec2 ndc = (vClipSpace.xy / vClipSpace.w) / 2.0 + 0.5;
	vec2 textCoords = vec2(ndc.x, ndc.y);
	
	float depth = texture2D(uRefractionDepthTexture, textCoords).r;
	float floorDistance = 2.0 * uNearPlane * uFarPlane / (uFarPlane + uNearPlane - (2.0 * depth - 1.0) * (uFarPlane - uNearPlane));
	float surfaceDistance = 2.0 * uNearPlane * uFarPlane / (uFarPlane + uNearPlane - (2.0 * gl_FragCoord.z - 1.0) * (uFarPlane - uNearPlane));
	
	depth = (floorDistance - surfaceDistance);
	float distort = ((vNormal.x / 80.0) * uDistortion) *  vLightWeighting.r;
	
	// Refraction
	vec3 refractColor = texture2D(uRefractionColorTexture, ndc - distort).rgb;
	refractColor /= vLightWeighting;
	refractColor = mix(refractColor, uColor, clamp(depth * uWaterDensity, 0.2, 1.0));
	
	// Reflection
	ndc.y = -ndc.y;
	vec3 reflectColor = texture2D(uReflectionColorTexture, ndc - distort).rgb;
	
	// Result
	vec3 color = mix(refractColor, reflectColor, clamp((depth - 0.5), 0.0, 0.3));
	color = mix(vec3(1.0, 1.0, 1.0), color, clamp(depth / uEdgeWhitening, 0.8, 1.0));
	
	gl_FragColor = vec4((color * vLightWeighting), clamp(depth / uEdgeSoftening, 0.0, 1.0));
	gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vVisibility), gl_FragColor.w);
}
