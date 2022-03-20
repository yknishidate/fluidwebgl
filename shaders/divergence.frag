precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 px;
varying vec2 uv;

// output: divergence
void main(){
    float x0 = texture2D(velocity, uv - vec2(px.x, 0)).x;
    float x1 = texture2D(velocity, uv + vec2(px.x, 0)).x;
    float y0 = texture2D(velocity, uv - vec2(0, px.y)).y;
    float y1 = texture2D(velocity, uv + vec2(0, px.y)).y;
    float dx = x1 - x0;
    float dy = y1 - y0;
    float divergence = (dx + dy) / 2.0;
    gl_FragColor = vec4(divergence);
}
