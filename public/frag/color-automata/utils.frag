int withinBounds(vec2 coord) {
  return coord.x < size.x && coord.y < size.y ? 1 : 0;
}

vec3 value(sampler2D texture, vec2 coord) {
  return vec3(texture2D(texture, coord / size));
}
