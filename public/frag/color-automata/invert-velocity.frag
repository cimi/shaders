precision highp float;

uniform sampler2D positionTex;
uniform sampler2D velocityTex;
uniform vec2 size;

uniform float invertBounce;

// include utils.frag

bool isPastEdge(float position) {
  return position > 1. || position < 0.;
}

float boost(float velocity) {
  if (velocity >= -.1 && velocity <= 0.) {
    return -.1;
  }
  if (velocity <= .1 && velocity >= 0.) {
    return .1;
  }
  return velocity;
}

float adjust(float velocity, float position) {
  if (isPastEdge(position + velocity)) {
    return -1. * invertBounce * velocity;
  } else {
    return velocity;
  }
}

vec3 invertVelocity(vec3 velocity, vec3 position) {
  vec3 newVelocity;
  newVelocity.x = adjust(velocity.x * 2. - 1., position.x);
  newVelocity.y = adjust(velocity.y * 2. - 1., position.y);
  newVelocity.z = adjust(velocity.z * 2. - 1., position.z);
  return (newVelocity + 1.) / 2.;
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  vec3 position = value(positionTex, coord);
  vec3 velocity = value(velocityTex, coord);

  gl_FragColor = vec4(invertVelocity(velocity, position), 1.);
}
