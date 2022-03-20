precision highp float;
uniform sampler2D velocity;
uniform sampler2D pressure;
uniform sampler2D divergence;
varying vec2 uv;

// output: screen
void main(){
    // gl_FragColor = vec4(0, 0, 1, 1);
    
    // vec2 vel = texture2D(velocity, uv).xy + 0.5;
    // gl_FragColor = vec4(vel, 0, 1);

    // float div = texture2D(divergence, uv).r + 0.5;
    // gl_FragColor = vec4(0, div, 0, 1);
    
    float pres = texture2D(pressure, uv).x;
    vec2 vel = texture2D(velocity, uv).xy + 0.5;
    gl_FragColor = vec4(pres, vel, 1.0);
}
