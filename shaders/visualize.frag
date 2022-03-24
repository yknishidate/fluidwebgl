precision highp float;
uniform sampler2D velocity;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform vec2 resolution;

// output: screen
void main(){
    gl_FragColor = vec4(gl_FragCoord.xy / resolution, 0, 1);
}
