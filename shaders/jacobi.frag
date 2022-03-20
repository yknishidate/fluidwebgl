precision highp float;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform float alpha;
uniform float beta;
uniform vec2 px;
varying vec2 uv;

// output: pressure
void main(){
    gl_FragColor = vec4(texture2D(pressure, uv).r);
}
