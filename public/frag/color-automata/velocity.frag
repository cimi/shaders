precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D previousVelocity;
uniform vec2 size;
uniform float u_time;

// [0, 1] -> 0..255
int toInt(float f) {
  return int(f * 255.);
}

// 0..255 -> [0, 1]
float toFloat(int i) {
  return float(i) / 255.;
}

ivec3 toInts(vec4 floats) {
  return ivec3(toInt(floats[0]), toInt(floats[1]), toInt(floats[2]));
}

vec4 toFloats(ivec3 ints) {
  return vec4(toFloat(ints[0]), toFloat(ints[1]), toFloat(ints[2]), 1.);
}

// [0, 1] -> -255..255
int toIntNeg(float f) {
  return int(f * 510.) - 255;
}

float toFloatNeg(int i) {
  return float(i + 255) / 510.;
}

vec4 toFloatsNeg(ivec3 ints) {
  return vec4(toFloatNeg(ints[0]), toFloatNeg(ints[1]), toFloatNeg(ints[2]), 1.);
}

ivec3 toIntsNeg(vec4 floats) {
  return ivec3(toIntNeg(floats[0]), toIntNeg(floats[1]), toIntNeg(floats[2]));
}

int withinBounds(vec2 coord) {
  return coord.x < size.x && coord.y < size.y ? 1 : 0;
}

ivec3 value(sampler2D texture, vec2 coord) {
  // TODO: accessing the textures in this way makes the frame rate drop to 15 fps
  // replacing the line below with a constant yields 60 fps
  return withinBounds(coord) == 1 ? toInts(texture2D(texture, coord / size)) : ivec3(0);
}

ivec3 valueNeg(sampler2D texture, vec2 coord) {
  return withinBounds(coord) == 1 ? toIntsNeg(texture2D(texture, coord / size)) : ivec3(0);
}

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
    return ivec3(255);
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
  return vec4(ivec3Normalize(separation), 1.);
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

  vec4 sep = separation(previousPosition, coord);
  gl_FragColor = .33 * (sep + toFloatsNeg(nextVelocity));
}
