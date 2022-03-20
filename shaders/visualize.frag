precision highp float;
uniform sampler2D velocity;
uniform sampler2D pressure;
varying vec2 uv;

// output: screen image
void main(){
    float pres = texture2D(pressure, uv).x;
    vec2 vel = texture2D(velocity, uv).xy + 0.5;
    gl_FragColor = vec4(pres, vel, 1.0);
}
