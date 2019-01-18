precision highp float;
uniform sampler2D previousPosition;
uniform sampler2D currentVelocity;
uniform vec2 size;

// include utils.frag

float adjust(float value) {
  if (value < 0.) {
    // return abs(value);
    return 0.;
  }
  if (value > 1.) {
    return 1.; // 2. - value;
  }
  return value;
}
vec3 adjust(vec3 position) {
  return vec3(adjust(position.x), adjust(position.y), adjust(position.z));
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  vec3 velocity = valueScaled(currentVelocity, coord);
  vec3 position = value(previousPosition, coord);

  vec3 nextPosition = adjust(velocity + position);
  // vec3 nextPosition = velocity + position;
  gl_FragColor = vec4(nextPosition, 1.);
}
