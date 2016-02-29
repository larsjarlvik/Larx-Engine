precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vVertexPosition;

uniform vec3 uColor;
uniform float uRadius;

void main(void) {
    vec2 m = vTextureCoord - vec2(0.5, 0.5);
    float distance = sqrt(m.x * m.x + m.y * m.y);
    
    float delta = 0.03 / uRadius;
    float start = 0.5 - (delta * 2.0);
    
    float alpha1 = smoothstep(start - delta, start, distance);
    float alpha2 = smoothstep(start + delta, start, distance);
    
    float alpha;
    if(alpha1 < alpha2) alpha = alpha1;
    else alpha = alpha2;
    
    gl_FragColor = vec4(uColor, alpha);

}