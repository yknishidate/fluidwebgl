precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 aspect;
varying vec2 uv;

// output: velocity
void main(){
    // gl_FragColor = texture2D(velocity, uv);
    vec2 vel = texture2D(velocity, uv).xy;
    vec2 offset = vel * dt * aspect;
    gl_FragColor = texture2D(velocity, uv - offset);
}
