// float withinBounds(float value, float limit) {
//   return step(0., value) - step(limit, value);
// }

// float withinBounds(vec2 coord) {
//   return step(2., withinBounds(coord.x, size.x) + withinBounds(coord.y, size.y));
//   // return coord.x <= size.x && coord.y <= size.y ? 1. : 0.;
// }

vec3 value(sampler2D texture, vec2 coord) {
  return vec3(texture2D(texture, coord / size));
}
