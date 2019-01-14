precision highp float;

uniform sampler2D positionTex;
uniform sampler2D velocityTex;
uniform vec2 size;

uniform float invertBounce;

// include utils.frag

bool isOnEdge(float position) {
  return position >= 1. || position <= 0.;
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
  if (isOnEdge(position)) {
    return -1. * invertBounce * velocity;
  } else {
    return velocity;
  }
}

vec3 invertVelocity(vec3 position, vec3 velocity) {
  vec3 newVelocity;
  newVelocity.x = adjust(velocity.x, position.x);
  newVelocity.y = adjust(velocity.y, position.y);
  newVelocity.z = adjust(velocity.z, position.z);
  return scale(newVelocity);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  vec3 position = value(positionTex, coord);
  vec3 velocity = valueScaled(velocityTex, coord);

  gl_FragColor = vec4(invertVelocity(position, velocity), 1.);
}
