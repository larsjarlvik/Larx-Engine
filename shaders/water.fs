precision mediump float;

varying vec4 vPosition;

varying vec2 vCoord;
varying float vVisibility;
varying vec2 refractBlurCoordinates[5];
varying vec2 reflectBlurCoordinates[5];
varying vec3 vLightWeighting;
varying vec3 vNormal;
varying vec2 vRefractTexCoords;

uniform vec3 uColor;
uniform vec3 uFogColor;
uniform float uDistortion;

uniform sampler2D uRefractionDepthTexture;
uniform sampler2D uRefractionColorTexture;
uniform sampler2D uReflectionColorTexture;

uniform float uWaterDensity;
uniform float uEdgeSoftening;
uniform float uEdgeWhitening;

const float near = 0.1;
const float far = 1000.0;
                                                   
void main(void) {    
    // Texture Coordinates
    
    // Depth
    float depth = texture2D(uRefractionDepthTexture, vRefractTexCoords).r;
    float floorDistance = 2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near));
    
    depth = gl_FragCoord.z;
    float surfaceDistance = 2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near));
    
    // Refraction
    depth = (floorDistance - surfaceDistance);
    float distort = ((vNormal.x / 80.0) * uDistortion) * vLightWeighting.r;
    
	lowp vec4 refraction = vec4(0.0);
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[0] - distort) * 0.204164;
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[1] - distort) * 0.304005;
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[2] - distort) * 0.304005;
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[3] - distort) * 0.093913;
	refraction += texture2D(uRefractionColorTexture, refractBlurCoordinates[4] - distort) * 0.093913;
    
    vec3 refractColor = refraction.rgb;
    refractColor /= vLightWeighting;
    refractColor = mix(refractColor, uColor, clamp(depth / 10.0, 0.2, 1.0));
    
    // Reflection
	lowp vec4 reflectColor = vec4(0.0);
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[0] - distort) * 0.204164;
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[1] - distort) * 0.304005;
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[2] - distort) * 0.304005;
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[3] - distort) * 0.093913;
	reflectColor += texture2D(uReflectionColorTexture, reflectBlurCoordinates[4] - distort) * 0.093913;
    
    vec3 color = mix(refractColor, reflectColor.rgb, clamp((depth - 0.5) * uWaterDensity, 0.0, 0.3));
    color = mix(vec3(1.0, 1.0, 1.0), color, clamp(depth / uEdgeWhitening, 0.8, 1.0));
        
    // Result
    gl_FragColor = vec4((color * vLightWeighting), clamp(depth / uEdgeSoftening, 0.0, 1.0));
    gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vVisibility), gl_FragColor.w);
}
