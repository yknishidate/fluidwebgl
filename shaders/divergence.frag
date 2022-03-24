precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 resolution;

// output: divergence
void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    gl_FragColor = vec4(0, 0, 0, 1);
}
