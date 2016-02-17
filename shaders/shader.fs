precision mediump float;

varying vec3 vColor;
varying vec3 vLightWeighting;

void main(void) {
    gl_FragColor = vec4(vColor * vLightWeighting, 1.0);
    
}