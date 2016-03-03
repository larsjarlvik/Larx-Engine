precision mediump float;

varying vec4 vPosition;

varying vec3 vTransformedNormal;
varying vec3 vNormal;
varying vec2 vCoord;
varying vec4 vClipSpace;
varying float vVisibility;
varying vec2 refractBlurCoordinates[5];
varying vec2 reflectBlurCoordinates[5];

uniform vec3 uColor;
uniform vec3 uFogColor;

uniform sampler2D uRefractionDepthTexture;
uniform sampler2D uRefractionColorTexture;
uniform sampler2D uReflectionColorTexture;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uSpecularWeight;

uniform float uDistortion;
uniform float uWaterDensity;
uniform float uEdgeSoftening;
uniform float uEdgeWhitening;
                                                   
void main(void) {    
    vec3 lightDirection = normalize(uLightingDirection - vPosition.xyz);
    vec3 normal = normalize(vTransformedNormal);
    
    float directionalLightWeighting = max(dot(vNormal, uLightingDirection), 0.0);
    
    vec3 lightWeighting = 
        uAmbientColor * 1.3 + 
        uDirectionalColor * directionalLightWeighting;
        
    if(uShininess > 0.0) {
        vec3 eyeDirection = normalize(-vPosition.xyz);
        vec3 reflectionDirection = reflect(lightDirection, normal);
        float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
    
        vec3 specularColor = vec3(1.0, 1.0, 1.0) * uSpecularWeight;
        lightWeighting += specularColor * specularLightWeighting;
    }
    
    // Texture Coordinates
    float near = 0.1;
    float far = 10000.0;
    vec2 ndc = (vClipSpace.xy / vClipSpace.w) / 2.0 + 0.5;
    vec2 refractTexCoords = vec2(ndc.x, ndc.y);
    vec2 reflectTexCoords = vec2(ndc.x, 1.0 - ndc.y);
    
    // Depth
    float depth = texture2D(uRefractionDepthTexture, refractTexCoords).r;
    float floorDistance = 2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near));
    
    depth = gl_FragCoord.z;
    float surfaceDistance = 2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near));
    
    // Refraction
    depth = (floorDistance - surfaceDistance);
    float distort = ((normal.x / 100.0) * uDistortion) * lightWeighting.r;
    
	lowp vec4 refraction = vec4(0.0);
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[0] - distort) * 0.204164;
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[1] - distort) * 0.304005;
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[2] - distort) * 0.304005;
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[3] - distort) * 0.093913;
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[4] - distort) * 0.093913;
    
    
    vec3 refractColor = refraction.rgb;
    refractColor /= lightWeighting;
    refractColor = mix(uColor, refractColor, 0.5);
    
    // Reflection
	lowp vec4 reflectColor = vec4(0.0);
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[0] - distort) * 0.204164;
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[1] - distort) * 0.304005;
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[2] - distort) * 0.304005;
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[3] - distort) * 0.093913;
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[4] - distort) * 0.093913;
    
    vec3 color = mix(refractColor, reflectColor.rgb, clamp((depth - 0.5) / 8.0, 0.0, 1.0));
    color = mix(vec3(1.0, 1.0, 1.0), color, clamp(depth / uEdgeSoftening, 0.9, 1.0));
        
    // Result
    gl_FragColor = vec4((color * lightWeighting), depth / uEdgeWhitening);
    gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vVisibility), gl_FragColor.w);
}
