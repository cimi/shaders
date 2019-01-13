precision highp float;

uniform sampler2D positionTex;
uniform sampler2D velocityTex;
uniform vec2 size;

// include utils.frag

float isOnEdge(float v) {
  return v >= 1. || v <= 0. ? -.5 : 1.;
}

vec3 invertVelocity(vec3 position, vec3 velocity) {
  vec3 newVelocity;
  newVelocity.x = isOnEdge(position.x) * velocity.x;
  newVelocity.y = isOnEdge(position.y) * velocity.y;
  newVelocity.z = isOnEdge(position.z) * velocity.z;
  return scale(newVelocity);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  vec3 position = value(positionTex, coord);
  vec3 velocity = valueScaled(velocityTex, coord);

  gl_FragColor = vec4(invertVelocity(position, velocity), 1.);
  // gl_FragColor = vec4(scale(velocity), 1.);
}
