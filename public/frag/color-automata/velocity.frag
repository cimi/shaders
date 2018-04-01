precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D previousVelocity;
uniform vec2 size;

int withinBounds(vec2 coord) {
  return coord.x < size.x && coord.y < size.y ? 1 : 0;
}

bool isEdge(vec4 color) {
  return vec3(color) == vec3(1.) || 0. == length(vec3(color));
}

vec4 adjustUp(vec4 velocity) {
  return vec4((vec3(velocity) + vec3(1.)) / 2., 1.);
}

vec4 adjustDown(vec4 velocity) {
  return vec4(vec3(velocity) * 2. - vec3(1.), 1.);
}

vec4 value(sampler2D texture, vec2 coord) {
  return withinBounds(coord) == 1 ? texture2D(texture, coord / size) : vec4(0.);
}

vec4 position(vec2 coord) {
  return value(previousPosition, coord);
}

vec4 velocity(vec2 coord) {
  vec4 previous = adjustDown(value(previousVelocity, coord));
  return isEdge(position(coord)) ? -1. * previous : previous;
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

vec4 sumAllVelocities(vec2 coord) {
  return velocity(coord+vec2(-1.,-1.)) +
    velocity(coord+vec2(-1.,0.)) +
    velocity(coord+vec2(-1.,1.)) +
    velocity(coord+vec2(0.,-1.)) +
    velocity(coord+vec2(0.,1.)) +
    velocity(coord+vec2(1.,-1.)) +
    velocity(coord+vec2(1.,0.)) +
    velocity(coord+vec2(1.,1.));
}

vec4 diff(sampler2D texture, vec2 firstCoords, vec2 secondCoords) {
  if (withinBounds(secondCoords) == 0) {
    return vec4(1.);
  }
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
  return 4. * normalize(separation);
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
  return sumAllNeighbors(texture, coord) / 1.;
}

vec4 neighborVelocityAverage(vec2 coord) {
  return sumAllVelocities(coord) / 8.;
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  vec4 avgVelocity = adjustDown(neighborVelocityAverage(coord));
  vec4 avgPosition = neighborAverage(previousPosition, coord);
  vec4 separation = separation(previousPosition, coord);

  vec4 nextVelocity = separation + (avgVelocity - velocity(coord)) + (avgPosition - position(coord));
  gl_FragColor = adjustUp(0.67 * nextVelocity);
}
