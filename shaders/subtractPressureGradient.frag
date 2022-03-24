precision highp float;
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform float alpha;
uniform float beta;
uniform vec2 resolution;

// output: velocity
void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 vel = texture2D(velocity, uv).xy;
    gl_FragColor = vec4(vel, 0.0, 1.0);
}
