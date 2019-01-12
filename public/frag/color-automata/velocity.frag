precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D previousVelocity;
uniform vec2 size;
uniform float u_time;

// include utils.frag

ivec3 position(vec2 coord) {
  return value(previousPosition, coord);
}

ivec3 velocity(vec2 coord) {
  if (withinBounds(coord) == 0) {
    return ivec3(0);
  }
  return valueNeg(previousVelocity, coord);
}

ivec3 sumAllPositions(vec2 coord) {
  return position(coord+vec2(-1.,-1.)) +
    position(coord+vec2(-1.,0.)) +
    position(coord+vec2(-1.,1.)) +
    position(coord+vec2(0.,-1.)) +
    position(coord+vec2(0.,1.)) +
    position(coord+vec2(1.,-1.)) +
    position(coord+vec2(1.,0.)) +
    position(coord+vec2(1.,1.));
}

ivec3 sumAllVelocities(vec2 coord) {
  return velocity(coord+vec2(-1.,-1.)) +
    velocity(coord+vec2(-1.,0.)) +
    velocity(coord+vec2(-1.,1.)) +
    velocity(coord+vec2(0.,-1.)) +
    velocity(coord+vec2(0.,1.)) +
    velocity(coord+vec2(1.,-1.)) +
    velocity(coord+vec2(1.,0.)) +
    velocity(coord+vec2(1.,1.));
}

float ivec3Length(ivec3 v) {
  return sqrt(float(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]));
}

vec3 ivec3Normalize(ivec3 v) {
  float len = ivec3Length(v);
  return vec3(float(v[0]) / len, float(v[1]) / len, float(v[2]) / len);
}

ivec3 diff(sampler2D texture, vec2 firstCoords, vec2 secondCoords) {
  if (withinBounds(secondCoords) == 0) {
    return ivec3(0);
  }
  ivec3 d = value(texture, firstCoords) - value(texture, secondCoords);
  return ivec3Length(d) < 64.0 ? d : ivec3(0);
}

vec4 separation(sampler2D texture, vec2 coord) {
  ivec3 separation = diff(texture, coord, coord+vec2(-1.,-1.)) +
    diff(texture, coord, coord+vec2(-1.,0.)) +
    diff(texture, coord, coord+vec2(-1.,1.)) +
    diff(texture, coord, coord+vec2(0.,-1.)) +
    diff(texture, coord, coord+vec2(0.,1.)) +
    diff(texture, coord, coord+vec2(1.,-1.)) +
    diff(texture, coord, coord+vec2(1.,0.)) +
    diff(texture, coord, coord+vec2(1.,1.));
  // TODO: fix separation computation
  return vec4(4. * ivec3Normalize(separation), 1.);
  // return normalize(toFloats(separation)) * 4.;
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

ivec3 neighborPositionAverage(vec2 coord) {
  return sumAllPositions(coord) / neighborCount(coord);
}

ivec3 neighborVelocityAverage(vec2 coord) {
  return sumAllVelocities(coord) / neighborCount(coord);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  ivec3 avgVelocity = neighborVelocityAverage(coord);
  ivec3 avgPosition = neighborPositionAverage(coord);
  ivec3 nextVelocity = (avgVelocity - velocity(coord)) + (avgPosition - position(coord));
  float ease = .33;
  vec4 sep = vec4(ease * vec3(separation(previousPosition, coord)), 1.);
  gl_FragColor = sep + toFloatsNeg(nextVelocity / 3);
}
