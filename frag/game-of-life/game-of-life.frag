precision mediump float;
uniform sampler2D previousState;
int wasAlive(vec2 coord) {
  if (coord.x < 0.0 || 64.0 < coord.x || coord.y < 0.0 || 64.0 < coord.y) return 0;
  vec4 px = texture2D(previousState, coord/64.0);
  return px.r < 0.1 ? 1 : 0;
}
void main(void) {
  vec2 coord = vec2(gl_FragCoord);
  int aliveNeighbors =
    wasAlive(coord+vec2(-1.,-1.)) +
    wasAlive(coord+vec2(-1.,0.)) +
    wasAlive(coord+vec2(-1.,1.)) +
    wasAlive(coord+vec2(0.,-1.)) +
    wasAlive(coord+vec2(0.,1.)) +
    wasAlive(coord+vec2(1.,-1.)) +
    wasAlive(coord+vec2(1.,0.)) +
    wasAlive(coord+vec2(1.,1.));
  bool nowAlive = wasAlive(coord) == 1 ? 2 <= aliveNeighbors && aliveNeighbors <= 3 : 3 == aliveNeighbors;
  gl_FragColor = nowAlive ? vec4(0.,0.,0.,1.) : vec4(1.,1.,1.,1.);
}
