precision highp float;

varying vec3 vColor;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec3 vTransformedNormal;

void main(void) {
    gl_FragColor = vec4((vColor), 1.0);
}   