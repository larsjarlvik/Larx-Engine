precision mediump float;

varying vec4 vPosition;
uniform float uOpacity;
uniform vec3 uColor;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uSpecularWeight;

varying vec3 vTransformedNormal;
varying vec3 vNormal;
varying float vWaterDepth;


void main(void) {    
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
    
        vec3 specularColor = vec3(1.0, 1.0, 1.0) * uSpecularWeight;
        lightWeighting += specularColor * specularLightWeighting;
    }
    
    float depth = -(vWaterDepth / 0.8);
    depth = clamp(depth, 0.0, uOpacity);
    
    gl_FragColor = vec4((uColor * lightWeighting), depth);
}