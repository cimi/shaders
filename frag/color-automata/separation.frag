precision highp float;

uniform sampler2D previousPosition;
uniform vec2 size;
uniform float separationThreshold;

// include utils.frag

vec2 pos(vec2 coord, int offsetX, int offsetY) {
  return coord + vec2(float(offsetX), float(offsetY));
}

vec3 v(vec2 coord, int offsetX, int offsetY) {
  return value(previousPosition, pos(coord, offsetX, offsetY));
}

vec3 diff(vec2 coords, int offsetX, int offsetY) {
  vec3 d = v(coords, 0, 0) - v(coords, offsetX, offsetY);
  return length(d) < separationThreshold ? d : vec3(0);
}

vec4 separation(vec2 coord) {
  vec3 separation = diff(coord, -1, -1) +
    diff(coord, -1, 0) +
    diff(coord, -1, 1) +
    diff(coord, 0, -1) +
    diff(coord, 0, 1) +
    diff(coord, 1, -1) +
    diff(coord, 1, 0) +
    diff(coord, 1, 1);
  return vec4(separation, 1.);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  gl_FragColor = separation(coord);
}
