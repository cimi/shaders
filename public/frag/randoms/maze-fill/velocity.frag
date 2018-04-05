precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D previousVelocity;

int withinBounds(vec2 coord) {
  if (coord.x < 0.0 || 64.0 < coord.x || coord.y < 0.0 || 64.0 < coord.y) return 0;
  return 1;
}

vec4 value(sampler2D texture, vec2 coord) {
  return withinBounds(coord) == 1 ? texture2D(texture, coord/64.0) : vec4(0.0);
}

vec4 position(vec2 coord) {
  return value(previousPosition, coord);
}

vec4 velocity(vec2 coord) {
  return value(previousVelocity, coord);
}

vec4 sumAllNeighbors(sampler2D texture, vec2 coord) {
  return value(texture, coord+vec2(-1.,-1.)) +
    value(texture, coord+vec2(-1.,0.)) +
    value(texture, coord+vec2(-1.,1.)) +
    value(texture, coord+vec2(0.,-1.)) +
    value(texture, coord+vec2(0.,1.)) +
    value(texture, coord+vec2(1.,-1.)) +
    value(texture, coord+vec2(1.,0.)) +
    value(texture, coord+vec2(1.,1.));
}

vec4 diff(sampler2D texture, vec2 firstCoords, vec2 secondCoords) {
  vec4 d = value(texture, firstCoords) - value(texture, secondCoords);
  return length(d) < 8.0 ? d : vec4(0.0);
}

vec4 separation(sampler2D texture, vec2 coord) {
  vec4 separation = diff(texture, coord, coord + vec2(-1.,-1.)) +
    diff(texture, coord, coord+vec2(-1.,0.)) +
    diff(texture, coord, coord+vec2(-1.,1.)) +
    diff(texture, coord, coord+vec2(0.,-1.)) +
    diff(texture, coord, coord+vec2(0.,1.)) +
    diff(texture, coord, coord+vec2(1.,-1.)) +
    diff(texture, coord, coord+vec2(1.,0.)) +
    diff(texture, coord, coord+vec2(1.,1.));
  // normalize separation vector
  float len = length(separation);
  return abs(len) > 0.0 ? (4.0 / len) * separation : vec4(0.);
}

float neighborCount(vec2 coord) {
  return float(withinBounds(coord+vec2(-1.,-1.)) +
    withinBounds(coord+vec2(-1.,0.)) +
    withinBounds(coord+vec2(-1.,1.)) +
    withinBounds(coord+vec2(0.,-1.)) +
    withinBounds(coord+vec2(0.,1.)) +
    withinBounds(coord+vec2(1.,-1.)) +
    withinBounds(coord+vec2(1.,0.)) +
    withinBounds(coord+vec2(1.,1.)));
}

vec4 neighborAverage(sampler2D texture, vec2 coord) {
  return sumAllNeighbors(texture, coord) / neighborCount(coord);
}

int onEdge(vec2 coord) {
  if (withinBounds(coord) == 1 && (coord.x == 64.0 || coord.y == 64.0)) return 1;
  return 0;
}

float bounceOffEdge(vec2 coord) {
  return onEdge(coord) == 1 ? -1. : 1.;
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  vec4 avgVelocity = neighborAverage(previousVelocity, coord);
  vec4 avgPosition = neighborAverage(previousPosition, coord);
  vec4 separation = separation(previousPosition, coord);
  float bounce = bounceOffEdge(coord);
  vec4 nextVelocity = bounce * (avgVelocity + avgPosition - position(coord) - velocity(coord));
  // range -255 255 we project to 0 255: + 256 / 2
  gl_FragColor = vec4(vec3(nextVelocity) + vec3(0.2) / 2., 1.);
}
