precision mediump float;

uniform sampler2D positionTex;
uniform sampler2D velocityTex;
uniform vec2 size;

// include utils.frag

int isOnEdge(int v) {
  return v >= 200 || v <= 50 ? -1 : 1;
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
