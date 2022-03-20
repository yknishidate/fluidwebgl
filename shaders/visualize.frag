precision highp float;
uniform sampler2D velocity;
uniform sampler2D pressure;
uniform sampler2D divergence;
varying vec2 uv;

// output: screen
void main(){
    gl_FragColor = vec4(0, 0, 1, 1);
}
