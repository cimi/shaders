precision highp float;

uniform sampler2D previousVelocity;
uniform sampler2D cohesion;
uniform sampler2D alignment;
uniform sampler2D separation;

uniform vec2 size;
uniform float time;

// include utils.frag

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  vec3 alignmentValue = valueScaled(alignment, coord);
  vec3 cohesionValue = value(cohesion, coord);
  vec3 separationValue = value(separation, coord);
  vec3 original = valueScaled(previousVelocity, coord);

  vec3 nextVelocity = original + .33 * (4. * separationValue + cohesionValue + alignmentValue / 10.);
  gl_FragColor = vec4(scale(nextVelocity), 1.);
}
