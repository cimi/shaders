precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D currentVelocity;

int withinBounds(vec2 coord) {
  if (coord.x < 0.0 || 64.0 < coord.x || coord.y < 0.0 || 64.0 < coord.y) return 0;
  return 1;
}

vec4 value(sampler2D texture, vec2 coord) {
  return withinBounds(coord) == 1 ? texture2D(texture, coord/64.0) : vec4(0.0);
}

int onEdge(vec2 coord) {
  if (withinBounds(coord) == 1 && (coord.x == 64.0 || coord.y == 64.0)) return 1;
  return 0;
}

int bounceOffEdges(vec2 coord) {
  return onEdge(coord) == 1 ? -1 : 1;
}

vec4 adjustUp(vec4 velocity) {
  return vec4((vec3(velocity) + vec3(1.)) / 2., 1.);
}

vec4 adjustDown(vec4 velocity) {
  return vec4(vec3(velocity) * 2. - vec3(1.), 1.);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  int bounce = bounceOffEdges(coord);

  // we need to cancel out the bounce, it takes effect next turn
  vec4 velocity = adjustDown(value(currentVelocity, coord));
  vec4 position = value(previousPosition, coord);
  vec4 nextPosition = float(bounce) * velocity + position;
  // gl_FragColor = vec4(vec3(1., 0., 1.), 1.);
  gl_FragColor = nextPosition;
  // gl_FragColor = nextPosition;
}
