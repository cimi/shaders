precision mediump float;

uniform sampler2D positionAverage;
uniform sampler2D velocityAverage;
uniform sampler2D separation;

uniform vec2 size;
uniform float time;

// include utils.frag

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  ivec3 avgVelocity = valueNeg(velocityAverage, coord);
  ivec3 avgPosition = value(positionAverage, coord);
  ivec3 sep = value(separation, coord);

  float ease = .33;
  ivec3 nextVelocity = avgVelocity + avgPosition;
  gl_FragColor = ease * toFloats(sep) + toFloatsNeg(nextVelocity / 1000);
}
