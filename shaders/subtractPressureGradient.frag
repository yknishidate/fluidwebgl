precision highp float;
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform float alpha;
uniform float beta;
uniform vec2 px;
varying vec2 uv;

// output: velocity
void main(){
    // vec2 v = texture2D(velocity, uv).xy;
    // gl_FragColor = vec4(v, 0.0, 1.0);

    // calc gradient
    float x0 = texture2D(pressure, uv - vec2(px.x, 0)).r;
    float x1 = texture2D(pressure, uv + vec2(px.x, 0)).r;
    float y0 = texture2D(pressure, uv - vec2(0, px.y)).r;
    float y1 = texture2D(pressure, uv + vec2(0, px.y)).r;
    float dx = x1 - x0;
    float dy = y1 - y0;
    vec2 gradient = vec2(dx, dy) / 2.0;

    // subtract
    vec2 vel = texture2D(velocity, uv).xy;
    vel -= gradient;
    gl_FragColor = vec4(vel, 0.0, 1.0);
}
