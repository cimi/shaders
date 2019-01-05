precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D previousVelocity;
uniform vec2 size;
uniform float u_time;

int withinBounds(vec2 coord) {
  return coord.x < size.x && coord.y < size.y ? 1 : 0;
}

bool isEdge(vec4 color) {
  return length(vec3(color)) > .9 || length(vec3(color)) < .1;
}

vec4 adjustUp(vec4 velocity) {
  return vec4(vec3(velocity) + vec3(.5), 1.);
}

vec4 adjustDown(vec4 velocity) {
  return vec4(vec3(velocity) - vec3(.5), 1.);
}

vec4 value(sampler2D texture, vec2 coord) {
  // TODO: accessing the textures in this way makes the frame rate drop to 15 fps
  // replacing the line below with a constant yields 60 fps
  return withinBounds(coord) == 1 ? texture2D(texture, coord / size) : vec4(0.);
}

vec4 position(vec2 coord) {
  return value(previousPosition, coord);
}

vec4 invertVelocity(vec4 position, vec4 previousVelocity) {
  vec4 velocity = vec4(1.);
  velocity.r = position.r == 1. || position.r == 0. ? 1. - previousVelocity.r : previousVelocity.r;
  velocity.g = position.g == 1. || position.g == 0. ? 1. - previousVelocity.g : previousVelocity.g;
  velocity.b = position.b == 1. || position.b == 0. ? 1. - previousVelocity.b : previousVelocity.b;
  return velocity;
}

vec4 velocity(vec2 coord) {
  if (withinBounds(coord) == 0) {
    return vec4(0.);
  }
  vec4 previous = adjustDown(value(previousVelocity, coord));
  return invertVelocity(position(coord), previous);
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
  return length(d) < 64.0 ? d : vec4(0.0);
}

vec4 separation(sampler2D texture, vec2 coord) {
  vec4 separation = diff(texture, coord, coord+vec2(-1.,-1.)) +
    diff(texture, coord, coord+vec2(-1.,0.)) +
    diff(texture, coord, coord+vec2(-1.,1.)) +
    diff(texture, coord, coord+vec2(0.,-1.)) +
    diff(texture, coord, coord+vec2(0.,1.)) +
    diff(texture, coord, coord+vec2(1.,-1.)) +
    diff(texture, coord, coord+vec2(1.,0.)) +
    diff(texture, coord, coord+vec2(1.,1.));
  // normalize separation vector
  return normalize(separation) * 4.;
}

float neighborCount(vec2 coord) {
  return float(
    withinBounds(coord+vec2(-1.,-1.)) +
    withinBounds(coord+vec2(-1.,0.)) +
    withinBounds(coord+vec2(-1.,1.)) +
    withinBounds(coord+vec2(0.,-1.)) +
    withinBounds(coord+vec2(0.,1.)) +
    withinBounds(coord+vec2(1.,-1.)) +
    withinBounds(coord+vec2(1.,0.)) +
    withinBounds(coord+vec2(1.,1.))
  );
}

vec4 neighborAverage(sampler2D texture, vec2 coord) {
  return sumAllNeighbors(texture, coord) / neighborCount(coord);
}

vec4 neighborVelocityAverage(vec2 coord) {
  return sumAllVelocities(coord) / neighborCount(coord);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(0.330,0.120))) * 43758.5453123);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  vec4 avgVelocity = neighborVelocityAverage(coord);
  vec4 avgPosition = neighborAverage(previousPosition, coord);
  vec4 separation = separation(previousPosition, coord);

  vec4 nextVelocity = separation * (avgVelocity - velocity(coord)) + (avgPosition - position(coord));
  // gl_FragColor = vec4(vec3(random(coord * sin(u_time))), 1.);
  gl_FragColor = adjustUp(0.33 * nextVelocity);
}
