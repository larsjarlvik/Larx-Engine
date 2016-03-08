attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform float uFogDensity;
uniform float uFogGradient;
uniform int uUseFog;
uniform vec2 uCursorPosition;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uSpecularWeight;

varying float vVisibility;
varying vec3 vColor;

varying vec3 vVertexPosition;

varying vec3 vLightWeighting;


varying vec2 vCursorCenter;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
    
    vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);
    vVertexPosition = aVertexPosition;
    
    if(uUseFog == 1) {
        float distance = length(gl_Position);
        vVisibility = clamp(exp(-pow((distance * uFogDensity), uFogGradient)), 0.0, 1.0);
    } else {
        vVisibility = 1.0;
    }
    
    vCursorCenter = vec2(vVertexPosition.x - uCursorPosition.x, vVertexPosition.z - uCursorPosition.y);
    
    vec3 lightDirection = normalize(uLightingDirection - position.xyz);
    
    float directionalLightWeighting = max(dot(aVertexNormal, uLightingDirection), 0.0);
    vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
        
    if(uShininess > 0.0) {
        vec3 normal = normalize(uNMatrix * aVertexNormal);
        vec3 eyeDirection = normalize(-position.xyz);
        vec3 reflectionDirection = reflect(lightDirection, normal);
        float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
    
        vec3 specularColor = uSpecularColor * uSpecularWeight;
        vLightWeighting += specularColor * specularLightWeighting;
    }
}