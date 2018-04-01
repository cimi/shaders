precision mediump float;
uniform sampler2D previousPosition;
uniform sampler2D currentVelocity;
uniform vec2 size;

vec4 value(sampler2D texture, vec2 coord) {
  return texture2D(texture, coord / size);
}

vec4 adjustDown(vec4 velocity) {
  return vec4(vec3(velocity) * 2. - vec3(1.), 1.);
}

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  // we need to cancel out the bounce, it takes effect next turn
  vec4 velocity = adjustDown(value(currentVelocity, coord));
  vec4 position = value(previousPosition, coord);
  vec4 nextPosition = velocity + position;
  gl_FragColor = nextPosition;
}
