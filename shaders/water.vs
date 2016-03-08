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

varying float vDistortion;
varying vec3 vNormal;
varying vec2 refractBlurCoordinates[5];
varying vec2 reflectBlurCoordinates[5];
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
    
    // Blur
	vec2 singleStepOffset = vec2(0.0003, 0.0003);
    
    vec2 ndc = (vClipSpace.xy / vClipSpace.w) / 2.0 + 0.5;
    vRefractTexCoords = vec2(ndc.x, ndc.y);
    
	refractBlurCoordinates[0] = ndc.xy;
	refractBlurCoordinates[1] = ndc.xy + singleStepOffset * 1.407333;
	refractBlurCoordinates[2] = ndc.xy - singleStepOffset * 1.407333;
	refractBlurCoordinates[3] = ndc.xy + singleStepOffset * 3.294215;
	refractBlurCoordinates[4] = ndc.xy - singleStepOffset * 3.294215;
    
    ndc.y = 1.0 - ndc.y;
	reflectBlurCoordinates[0] = ndc.xy;
	reflectBlurCoordinates[1] = ndc.xy + singleStepOffset * 1.407333;
	reflectBlurCoordinates[2] = ndc.xy - singleStepOffset * 1.407333;
	reflectBlurCoordinates[3] = ndc.xy + singleStepOffset * 3.294215;
	reflectBlurCoordinates[4] = ndc.xy - singleStepOffset * 3.294215;
    
    vNormal = aVertexNormal;
    vNormal.x *= 6.0;
    vNormal.z *= 6.0;
    vNormal = normalize(uNMatrix * vNormal);
    
    vec3 lightDirection = normalize(uLightingDirection - vPosition.xyz);
    float directionalLightWeighting = max(dot(vNormal, uLightingDirection), 0.0);
    
    vLightWeighting = 
        uAmbientColor * 1.3 + 
        uDirectionalColor * directionalLightWeighting;
        
    if(uShininess > 0.0) {
        vec3 eyeDirection = normalize(-vPosition.xyz);
        vec3 reflectionDirection = reflect(lightDirection, vNormal);
        float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
    
        vec3 specularColor = vec3(1.0, 1.0, 1.0) * uSpecularWeight;
        vLightWeighting += specularColor * specularLightWeighting;
    }
}
