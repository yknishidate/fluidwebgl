precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 resolution;

// output: velocity
void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = texture2D(velocity, uv);
}
