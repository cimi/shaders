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

  vec3 alignmentValue = value(alignment, coord) * alignmentWeight;
  vec3 cohesionValue = value(cohesion, coord) * cohesionWeight;
  vec3 separationValue = value(separation, coord) * separationWeight;
  vec3 original = value(previousVelocity, coord) * velocityWeight;

  vec3 nextVelocity = original + velocityEase * (separationValue + cohesionValue + alignmentValue);
  gl_FragColor = vec4(nextVelocity, 1.);
}
