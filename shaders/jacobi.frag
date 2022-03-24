precision highp float;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform float alpha;
uniform float beta;
uniform vec2 resolution;

// output: pressure
void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    gl_FragColor = vec4(texture2D(pressure, uv).r);
}
