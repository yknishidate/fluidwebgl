precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 aspect;
varying vec2 uv;

// output: velocity
void main(){
    gl_FragColor = texture2D(velocity, uv);
}
