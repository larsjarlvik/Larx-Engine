precision mediump float;

varying vec3 vColor;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec3 vTransformedNormal;
varying vec3 vVertexPosition;
varying float vVisibility;
varying vec3 vLightWeighting;

uniform vec3 uFogColor;

uniform int uDrawCursor;
varying vec2 vCursorCenter;

uniform int uClipPlane;
uniform float uClipPlaneLevel;

const int CLIP_ABOVE = 1;
const int CLIP_BELOW = 2;

void drawCursor() {
    
    float distance = sqrt(vCursorCenter.x * vCursorCenter.x + vCursorCenter.y * vCursorCenter.y);
    float delta = 0.2;
    float start = 1.0 - (delta * 2.0);
    
    if(distance < 2.0) {
        float alpha1 = start - delta;
        float alpha2 = start + delta;
        
        if(alpha1 > alpha2) alpha1 = alpha2;    
        gl_FragColor = mix(gl_FragColor, vec4(1.0, 1.0, 1.0, 1.0), alpha1);
    }
}

void main(void) {   
    if(uClipPlane == CLIP_ABOVE && vVertexPosition.y < -uClipPlaneLevel) discard;
    if(uClipPlane == CLIP_BELOW && vVertexPosition.y > -uClipPlaneLevel) discard;   
    
    gl_FragColor = vec4((vColor * vLightWeighting), 1.0);
    gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vVisibility), gl_FragColor.w);
}