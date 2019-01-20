precision highp float;
uniform sampler2D tex;
uniform vec2 size;

// include utils.frag

vec2 pos(vec2 coord, int offsetX, int offsetY) {
  return coord + vec2(float(offsetX), float(offsetY));
}

vec3 v(vec2 coord, int offsetX, int offsetY) {
  vec2 newPos = pos(coord, offsetX, offsetY);
  return value(tex, newPos);
}

vec3 sumNeighbors(vec2 coord) {
  return v(coord, -1, -1) +
    v(coord, -1, 0) +
    v(coord, -1, 1) +
    v(coord, 0, -1) +
    v(coord, 0, 1) +
    v(coord, 1, -1) +
    v(coord, 1, 0) +
    v(coord, 1, 1);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  vec3 average = sumNeighbors(coord) / 8.;
  vec3 d = average - v(coord, 0, 0);
  gl_FragColor = vec4(d, 0.);
}
