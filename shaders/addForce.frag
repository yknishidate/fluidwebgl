precision highp float;

uniform vec2 mouse_move;
uniform vec2 mouse_pos;
uniform vec2 cursor_size;
uniform vec2 px;
varying vec2 uv;

// output: velocity
void main(){
    // gl_FragColor = vec4(0, 0, 0, 1);
    float dist = length((uv - mouse_pos) / cursor_size);
    if(dist < 1.0){
        vec2 force = mouse_move * 0.1;
        gl_FragColor = vec4(force, 0, 1);
    }
}
