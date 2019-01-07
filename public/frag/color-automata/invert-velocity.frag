precision mediump float;

uniform sampler2D positionTex;
uniform sampler2D velocityTex;
uniform vec2 size;

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

int isOnEdge(int v) {
  return v >= 250 || v <= 5 ? -1 : 1;
}

ivec3 invertVelocity(ivec3 position, ivec3 velocity) {
  ivec3 newVelocity;
  newVelocity.x = isOnEdge(position.x) * velocity.x;
  newVelocity.y = isOnEdge(position.y) * velocity.y;
  newVelocity.z = isOnEdge(position.z) * velocity.z;
  return newVelocity;
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  ivec3 position = value(positionTex, coord);
  ivec3 velocity = valueNeg(velocityTex, coord);

  gl_FragColor = toFloatsNeg(invertVelocity(position, velocity));
}
