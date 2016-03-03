precision mediump float;

varying vec3 vColor;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTransformedNormal;
varying vec3 vVertexPosition;
varying float vVisibility;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;
uniform vec3 uSpecularColor;
uniform vec3 uFogColor;

uniform float uOpacity;
uniform float uShininess;
uniform float uSpecularWeight;

uniform int uClipPlane;
uniform float uClipPlaneLevel;
    
void main(void) {   
    if(uClipPlane == 1 && vVertexPosition.y < -uClipPlaneLevel)
        discard;
    if(uClipPlane == 2 && vVertexPosition.y > -uClipPlaneLevel)
        discard;
    
    vec3 lightDirection = normalize(uLightingDirection - vPosition.xyz);
    vec3 normal = normalize(vTransformedNormal);
    
    float directionalLightWeighting = max(dot(vNormal, uLightingDirection), 0.0);
    
    vec3 lightWeighting = 
        uAmbientColor + 
        uDirectionalColor * directionalLightWeighting;
        
    if(uShininess > 0.0) {
        vec3 eyeDirection = normalize(-vPosition.xyz);
        vec3 reflectionDirection = reflect(lightDirection, normal);
        float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
    
        vec3 specularColor = uSpecularColor * uSpecularWeight;
        lightWeighting += specularColor * specularLightWeighting;
    }
    
    gl_FragColor = vec4((vColor * lightWeighting), 1.0 - vVisibility);
    gl_FragColor = mix(vec4(uFogColor, 1.0), gl_FragColor, vVisibility);
}