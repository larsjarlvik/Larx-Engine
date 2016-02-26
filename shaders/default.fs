precision mediump float;

varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTransformedNormal;
uniform float uOpacity;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;
uniform vec3 uSpecularColor;
uniform vec3 uWaterColor;

uniform float uShininess;
uniform float uSpecularWeight;
    
varying vec3 vColor;
varying vec3 vVertexPosition;

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
    
        vec3 specularColor = uSpecularColor * uSpecularWeight;
        lightWeighting += specularColor * specularLightWeighting;
    }
    
    vec3 terrainColor = (vColor * lightWeighting);
    vec3 finalColor;
    
    if(vVertexPosition.y < 0.0) {
        float waterMix = clamp(-vVertexPosition.y / 3.0, 0.0, 1.0);
        float fadeMix = clamp(-(vVertexPosition.y + 3.0) / 1.0, 0.0, 1.0);
        
        finalColor = mix(terrainColor, uWaterColor, waterMix);
        finalColor = mix(finalColor, vec3(0, 0, 0), fadeMix);
        
    } else {
        finalColor = terrainColor;
    }
    
    gl_FragColor = vec4(finalColor, uOpacity);
}