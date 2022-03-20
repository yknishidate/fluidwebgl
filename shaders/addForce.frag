precision highp float;

uniform vec2 force; // mouse
uniform vec2 center; // mouse
uniform vec2 scale;
uniform vec2 px;
varying vec2 uv;


// output: velocity 1
void main(){
    float distance_ = 1.0 - min(length((uv - center) / scale), 1.0);
    gl_FragColor = vec4(force * distance_, 0, 1);
}
