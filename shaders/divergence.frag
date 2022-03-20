precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 px; // vec2(1/width, 1/height)
varying vec2 uv;

// output: divergence
void main(){
    gl_FragColor = vec4(0, 0, 0, 1);
}
