precision mediump float;

uniform sampler2D previousPosition;
uniform vec2 size;

// include utils.frag

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

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  gl_FragColor = separation(previousPosition, coord);
}
