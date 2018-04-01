precision mediump float;
uniform sampler2D state;
uniform vec2 size;

void main(void) {
  vec2 coord = vec2(gl_FragCoord) / size;
  gl_FragColor = texture2D(state, coord);
}
