precision mediump float;

varying vec4 vPosition;

varying vec3 vTransformedNormal;
varying vec3 vNormal;
varying vec2 vCoord;
varying vec4 vClipSpace;
varying float vVisibility;
varying vec2 blurCoordinates[5];

uniform float uOpacity;
uniform vec3 uColor;
uniform vec3 uFogColor;

uniform sampler2D uColorTexture;
uniform sampler2D uDepthTexture;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uLightingDirection;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uSpecularWeight;


                                                                                   
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
    
    // Depth
    float depth = texture2D(uDepthTexture, ndc).r;
    float floorDistance = 2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near));
    
    depth = gl_FragCoord.z;
    float surfaceDistance = 2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near));
    
    // Refraction
    depth = (floorDistance - surfaceDistance);
    float distort = (normal.x / 25.0) * lightWeighting.r;
    
	lowp vec4 tex = vec4(0.0);
	tex += texture2D(uColorTexture, blurCoordinates[0] - distort) * 0.204164;
	tex += texture2D(uColorTexture, blurCoordinates[1] - distort) * 0.304005;
	tex += texture2D(uColorTexture, blurCoordinates[2] - distort) * 0.304005;
	tex += texture2D(uColorTexture, blurCoordinates[3] - distort) * 0.093913;
	tex += texture2D(uColorTexture, blurCoordinates[4] - distort) * 0.093913;
    
    vec3 color = tex.rgb;
    color /= lightWeighting;
    color = mix(uColor, color, 0.5);
    
    color = mix(color, vec3(0.098, 0.535, 0.520), clamp(depth * 0.2, 0.0, 0.9));
    depth = clamp((depth * 3.0), 0.0, 1.0);
        
    // Result
    gl_FragColor = vec4((color * lightWeighting), depth);
    gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vVisibility), gl_FragColor.w);
}
