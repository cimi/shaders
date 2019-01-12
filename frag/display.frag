precision mediump float;
uniform sampler2D tex;
uniform vec2 size;

vec4 value(sampler2D texture, vec2 coord) {
  return texture2D(texture, coord / float(size[0]));
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  gl_FragColor = value(tex, coord);
}
