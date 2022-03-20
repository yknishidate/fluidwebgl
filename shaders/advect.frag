precision highp float;
uniform sampler2D source;
uniform sampler2D velocity;
uniform float dt;
uniform float scale;
uniform vec2 px1;
varying vec2 uv;

// output: velocity 1
void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    vec2 offset = vel * dt * px1;
    gl_FragColor = texture2D(source, uv - offset) * scale;
}
