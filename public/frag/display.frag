precision mediump float;
uniform sampler2D tex;
uniform vec2 size;

vec4 value(sampler2D texture, vec2 coord) {
  return texture2D(texture, coord / size);
}

vec4 valueScaled(sampler2D texture, vec2 coord) {
  return vec4(abs(2. * vec3(value(texture, coord)) - vec3(1.)), 1.);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  // gl_FragColor = valueScaled(tex, coord);
  gl_FragColor = value(tex, coord);
}
