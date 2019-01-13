precision highp float;

uniform sampler2D previousVelocity;
uniform sampler2D cohesion;
uniform sampler2D alignment;
uniform sampler2D separation;

uniform vec2 size;
uniform float time;

uniform float velocityEase;
uniform float velocityWeight;
uniform float cohesionWeight;
uniform float alignmentWeight;
uniform float separationWeight;

// include utils.frag

void main(void) {
  vec2 coord = vec2(gl_FragCoord);

  vec3 alignmentValue = valueScaled(alignment, coord) * alignmentWeight;
  vec3 cohesionValue = value(cohesion, coord) * cohesionWeight;
  vec3 separationValue = value(separation, coord) * separationWeight;
  vec3 original = valueScaled(previousVelocity, coord) * velocityWeight;

  // vec3 nextVelocity = original + .33 * (4. * separationValue + cohesionValue + alignmentValue / 9.5);
  vec3 nextVelocity = original + velocityEase * (separationValue + cohesionValue + alignmentValue);
  gl_FragColor = vec4(scale(nextVelocity), 1.);
}
