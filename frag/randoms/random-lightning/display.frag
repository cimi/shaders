precision mediump float;
uniform sampler2D state;
uniform vec2 size;

int withinBounds(vec2 coord) {
  return coord.x < size.x && coord.y < size.y ? 1 : 0;
}

vec4 value(sampler2D texture, vec2 coord) {
  return withinBounds(coord) == 1 ? texture2D(texture, coord / size) : vec4(0.);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  gl_FragColor = value(state, coord);
}
