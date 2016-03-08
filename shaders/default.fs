precision mediump float;

varying vec3 vColor;
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

    float val    = step(distance, 1.0); 
    gl_FragColor = mix(gl_FragColor, vec4(1.0, 1.0, 1.0, 0.6), val);
}

void main(void) {   
    if(uClipPlane == CLIP_ABOVE && vVertexPosition.y < -uClipPlaneLevel) discard;
    if(uClipPlane == CLIP_BELOW && vVertexPosition.y > -uClipPlaneLevel) discard;   
    
    gl_FragColor = vec4((vColor * vLightWeighting), 1.0);
    gl_FragColor = vec4(mix(uFogColor, gl_FragColor.xyz, vVisibility), gl_FragColor.w);
    
    //if(uDrawCursor == 1) drawCursor();
}