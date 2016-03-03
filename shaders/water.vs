attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform float uFogDensity;
uniform float uFogGradient;

varying vec3 vNormal;
varying vec3 vTransformedNormal;
varying vec2 refractBlurCoordinates[5];
varying vec2 reflectBlurCoordinates[5];

varying vec4 vPosition;
varying vec4 vClipSpace;
varying float vVisibility;

void main(void) {
    vec4 position = vec4(aVertexPosition, 1.0);
    
    vNormal = aVertexNormal;
    vTransformedNormal = uNMatrix * vNormal;
    
    vClipSpace = uPMatrix * uMVMatrix * position;
    gl_Position = vClipSpace;
    
    vPosition = uMVMatrix * position;
    
    float distance = length(gl_Position);
    vVisibility = clamp(exp(-pow((distance * uFogDensity), uFogGradient)), 0.0, 1.0);
    
    // Blur
	vec2 singleStepOffset = vec2(0.0003, 0.0003);
    
    vec2 ndc = (vClipSpace.xy / vClipSpace.w) / 2.0 + 0.5;
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
}
