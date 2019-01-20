precision highp float;
uniform sampler2D tex;
uniform vec2 size;

vec4 value(sampler2D texture, vec2 coord) {
  return texture2D(texture, coord / size);
}

vec4 valueScaled(sampler2D texture, vec2 coord) {
  return vec4(abs(2. * vec3(value(texture, coord)) - vec3(1.)), 1.);
}

bool isOnEdge(float v) {
  return v == 1. || v == 0.;
}

vec4 hilightEdge(vec4 value) {
  vec4 result;
  result.x = isOnEdge(value.x) ? abs(value.x - .11) : value.x;
  result.y = isOnEdge(value.y) ? abs(value.y - .22) : value.y;
  result.z = isOnEdge(value.z) ? abs(value.z - .11) : value.z;
  result[3] = 1.;
  if (isOnEdge(value.x) || isOnEdge(value.y) || isOnEdge(value.z)) {
    return vec4(vec3(.5), 1.);
  }
  return result;
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  // gl_FragColor = valueScaled(tex, coord);
  // gl_FragColor = hilightEdge(value(tex, coord));
  gl_FragColor = value(tex, coord);
}
