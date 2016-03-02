attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform float uFogDensity;
uniform float uFogGradient;

varying vec3 vNormal;
varying vec3 vTransformedNormal;
varying vec2 blurCoordinates[5];

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
    
    vec2 ndc = (vClipSpace.xy / vClipSpace.w) / 2.0 + 0.5;
	vec2 singleStepOffset = vec2(0.0003, 0.0003);
	blurCoordinates[0] = ndc.xy;
	blurCoordinates[1] = ndc.xy + singleStepOffset * 1.407333;
	blurCoordinates[2] = ndc.xy - singleStepOffset * 1.407333;
	blurCoordinates[3] = ndc.xy + singleStepOffset * 3.294215;
	blurCoordinates[4] = ndc.xy - singleStepOffset * 3.294215;
}
