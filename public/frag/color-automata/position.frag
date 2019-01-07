precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D currentVelocity;
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

ivec3 value(sampler2D texture, vec2 coord) {
  return toInts(texture2D(texture, coord / size));
}

ivec3 valueNeg(sampler2D texture, vec2 coord) {
  return toIntsNeg(texture2D(texture, coord / size));
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  ivec3 velocity = valueNeg(currentVelocity, coord);
  ivec3 position = value(previousPosition, coord);
  ivec3 nextPosition = (velocity / 5) + position;
  gl_FragColor = toFloats(nextPosition);
}
