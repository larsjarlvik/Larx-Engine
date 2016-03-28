attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform float uFogDensity;
uniform float uFogGradient;
uniform float uTime;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uSpecularWeight;

varying vec3 vNormal;
varying vec4 vClipSpace;

varying vec4 vPosition;
varying float vVisibility;
varying vec3 vLightWeighting;
varying vec2 vRefractTexCoords;

void main(void) {
	vec4 position = vec4(aVertexPosition, 1.0);
	vClipSpace = uPMatrix * uMVMatrix * position;
	gl_Position = vClipSpace;
	vPosition = uMVMatrix * position;
	
	float distance = length(gl_Position);
	vVisibility = clamp(exp(-pow((distance * uFogDensity), uFogGradient)), 0.0, 1.0);
	
	vNormal = aVertexNormal;
	vNormal = normalize(aVertexNormal * vNormal);
	vNormal.x *= 12.0;
	vNormal.z *= 12.0;
	
	vec3 lightDirection = normalize(uLightingDirection - position.xyz);
	float directionalLightWeighting = max(dot(vNormal, uLightingDirection), 0.0);
	vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
	
	if(uShininess > 0.0) {
		vec3 eyeDirection = normalize(-position.xyz);
		vec3 reflectionDirection = reflect(lightDirection, vNormal);
		float specularLightWeighting = pow(max(0.0, dot(reflectionDirection, eyeDirection)), uShininess);
	
		vec3 specularColor = uSpecularColor * uSpecularWeight;
		vLightWeighting += specularColor * specularLightWeighting;
	}
}
