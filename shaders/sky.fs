precision mediump float;

uniform vec3 uStop1;
uniform vec3 uStop2;
uniform vec3 uStop3;

varying float vTextureY;

void main(void) {    
    
    vec3 finalColor;
    
    finalColor = mix(uStop1, uStop2, smoothstep(0.0, 0.2, vTextureY));
    finalColor = mix(finalColor, uStop3, smoothstep(0.2, 0.7, vTextureY));
    
    gl_FragColor = vec4(finalColor, 1.0);
}   