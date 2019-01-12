precision mediump float;
uniform sampler2D tex;
uniform vec2 size;

// include utils.frag

vec2 pos(vec2 coord, int offsetX, int offsetY) {
  return coord + vec2(float(offsetX), float(offsetY));
}

vec3 v(vec2 coord, int offsetX, int offsetY) {
  return vec3(texture2D(tex, pos(coord, offsetX, offsetY) / size));
  // return value(tex, pos(coord, offsetX, offsetY));
}

vec3 sumNeighbors(vec2 coord) {
  return v(coord, -1, -1) +
    v(coord, -1, 0) +
    v(coord, -1, 1) +
    v(coord, 0, -1) +
    v(coord, 0, 0) +
    v(coord, 0, 1) +
    v(coord, 1, -1) +
    v(coord, 1, 0) +
    v(coord, 1, 1);
}

int neighborCount(vec2 coord) {
  return withinBounds(coord+vec2(-1.,-1.)) +
    withinBounds(coord+vec2(-1.,0.)) +
    withinBounds(coord+vec2(-1.,1.)) +
    withinBounds(coord+vec2(0.,-1.)) +
    withinBounds(coord+vec2(0.,1.)) +
    withinBounds(coord+vec2(1.,-1.)) +
    withinBounds(coord+vec2(1.,0.)) +
    withinBounds(coord+vec2(1.,1.));
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  vec3 average = sumNeighbors(coord) / float(neighborCount(coord));
  vec3 d = average - v(coord, 0, 0);
  gl_FragColor = vec4(d, 1.);
}
