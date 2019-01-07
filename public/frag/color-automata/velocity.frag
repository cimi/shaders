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

int isOnEdge(int v) {
  return v >= 250 || v <= 5 ? -1 : 1;
}

ivec3 invertVelocity(ivec3 position, ivec3 previousVelocity) {
  ivec3 velocity = ivec3(0);
  velocity.x = isOnEdge(position.x + previousVelocity.x) * previousVelocity.x;
  velocity.y = isOnEdge(position.y + previousVelocity.y) * previousVelocity.y;
  velocity.z = isOnEdge(position.z + previousVelocity.z) * previousVelocity.z;
  return velocity;
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

ivec3 diff(sampler2D texture, vec2 firstCoords, vec2 secondCoords) {
  if (withinBounds(secondCoords) == 0) {
    return ivec3(255);
  }
  ivec3 d = value(texture, firstCoords) - value(texture, secondCoords);
  return sqrt(float(d[0] * d[0] + d[1] * d[1] + d[2] * d[2])) < 64.0 ? d : ivec3(0);
}

ivec3 separation(sampler2D texture, vec2 coord) {
  ivec3 separation = diff(texture, coord, coord+vec2(-1.,-1.)) +
    diff(texture, coord, coord+vec2(-1.,0.)) +
    diff(texture, coord, coord+vec2(-1.,1.)) +
    diff(texture, coord, coord+vec2(0.,-1.)) +
    diff(texture, coord, coord+vec2(0.,1.)) +
    diff(texture, coord, coord+vec2(1.,-1.)) +
    diff(texture, coord, coord+vec2(1.,0.)) +
    diff(texture, coord, coord+vec2(1.,1.));
  // normalize separation vector
  return toInts(normalize(toFloats(separation)) * 4.);
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

// float random (vec2 st) {
//     return fract(sin(dot(st.xy, vec2(0.330,0.120))) * 43758.5453123);
// }

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  ivec3 avgVelocity = neighborVelocityAverage(coord);
  ivec3 avgPosition = neighborPositionAverage(coord);
  ivec3 separation = separation(previousPosition, coord);

  ivec3 nextVelocity = separation * (avgVelocity - velocity(coord)) + (avgPosition - position(coord));

  // gl_FragColor = vec4(vec3(random(coord * sin(u_time))), 1.);

  // TODO: inverting the velocity should be done after computing the final position
  // so that it actually touches the edges
  gl_FragColor = .33 * toFloats(invertVelocity(position(coord), nextVelocity));
}
