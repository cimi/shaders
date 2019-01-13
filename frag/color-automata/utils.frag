int withinBounds(vec2 coord) {
  return coord.x < size.x && coord.y < size.y ? 1 : 0;
}

vec3 value(sampler2D texture, vec2 coord) {
  return vec3(texture2D(texture, coord / size));
}

vec3 valueScaled(sampler2D texture, vec2 coord) {
  return 2. * value(texture, coord) - vec3(1.);
}

vec3 scale(vec3 velocity) {
  return (velocity + vec3(1.)) * .5;
}
