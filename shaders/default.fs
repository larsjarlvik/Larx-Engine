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

const int CLIP_ABOVE = 1;
const int CLIP_BELOW = 2;

void main(void) {   
    float nearestLight = texture2D(uShadowMapTexture, vShadowCoords.xy).r;
    float lightFactor = 1.0;
    
    if(vShadowCoords.z > nearestLight) {
        lightFactor = 1.0 - vShadowCoords.w;
    }
    
    if(uClipPlane == CLIP_ABOVE && vVertexPosition.y < -uClipPlaneLevel) discard;
    if(uClipPlane == CLIP_BELOW && vVertexPosition.y > -uClipPlaneLevel) discard;   
    
    gl_FragColor = vec4((vColor * vLightWeighting), 1.0);
    gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vVisibility), gl_FragColor.w);
    gl_FragColor*= lightFactor;
}