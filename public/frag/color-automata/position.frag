precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D currentVelocity;
uniform vec2 size;

// include utils.frag

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  ivec3 velocity = valueNeg(currentVelocity, coord);
  ivec3 position = value(previousPosition, coord);

  ivec3 nextPosition = velocity + position;
  gl_FragColor = toFloats(nextPosition);
}
