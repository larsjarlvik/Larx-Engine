precision mediump float;

varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTransformedNormal;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;
    
varying vec3 vColor;

void main(void) {
    vec3 lightDirection = normalize(uLightingDirection - vPosition.xyz);
    vec3 normal = normalize(vTransformedNormal);
            
    vec3 eyeDirection = normalize(-vPosition.xyz);
    vec3 reflectionDirection = reflect(lightDirection, normal);
    
    float shininess = 5.0;
    vec3 specularColor = vec3(0.8, 0.8, 0.8);
    
    float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess);
    float directionalLightWeighting = max(dot(vNormal, uLightingDirection), 0.0);
    
    vec3 lightWeighting = 
        uAmbientColor + 
        uDirectionalColor * directionalLightWeighting +
        specularColor * specularLightWeighting;
    
    gl_FragColor = vec4(vColor * lightWeighting, 1.0);
}