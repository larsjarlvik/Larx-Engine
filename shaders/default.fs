precision mediump float;

varying vec3 vColor;
varying vec3 vVertexPosition;
varying float vVisibility;
varying vec3 vLightWeighting;

uniform vec3 uFogColor;

uniform int uClipPlane;
uniform float uClipPlaneLevel;

uniform sampler2D uShadowMapTexture;
varying vec4 vShadowCoords;
uniform float uShadowMapResolution;

const int CLIP_ABOVE = 1;
const int CLIP_BELOW = 2;

const float PCF_COUNT = 2.0;
float texelSize = 1.0 / uShadowMapResolution;

float getShadowFactor() {
    float totalTexels = (PCF_COUNT * 2.0 + 1.0) * (PCF_COUNT * 2.0 + 1.0);
    float total = 0.0;
    
    for(float x = -PCF_COUNT; x <= PCF_COUNT; x += 1.0) {
        for(float y = -PCF_COUNT; y <= PCF_COUNT; y += 1.0) {
            float nearestLight = texture2D(uShadowMapTexture, vShadowCoords.xy + vec2(x, y) * texelSize).r;
            if(vShadowCoords.z > nearestLight) {
                total += 1.0;
            }
        }
    }
    
    total /= totalTexels;
    
    return 1.0 - (total * vShadowCoords.w);
}

void main(void) {   
    
    if(uClipPlane == CLIP_ABOVE && vVertexPosition.y < -uClipPlaneLevel) discard;
    if(uClipPlane == CLIP_BELOW && vVertexPosition.y > -uClipPlaneLevel) discard;   
    
    gl_FragColor = vec4((vColor * vLightWeighting), 1.0);
    gl_FragColor*= getShadowFactor();
    gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vVisibility), gl_FragColor.w);
}