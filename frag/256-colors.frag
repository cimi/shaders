// Author Alex Ciminian - 2018
// Title: 256 Colors

// started from an example in https://thebookofshaders.com/09/
// published at: http://glslsandbox.com/e#45710.0
// published at: http://thebookofshaders.com/edit.php?log=180306235848

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec2 tile(vec2 _st, float _zoom) {
    _st *= _zoom;
    return fract(_st);
}

float box(vec2 _st, vec2 border) {
    vec2 uv = step(border, _st);
    return uv.x * uv.y;
}

void main(void) {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    float tileScaling = 16.;

    float tileCount = tileScaling * tileScaling;
    float tileId = 1. + floor(st.x * tileScaling) + tileScaling * floor(st.y * tileScaling);

    // Divide the space in 256
    st = tile(st, tileScaling);

    // Draw the tile
    float modifier = tileId / tileCount;
    vec3 color = vec3(
        abs(cos(modifier * u_time)),
        sin(modifier * u_time * .8),
        fract(modifier * u_time * .5));
    float opacity = (abs(sin(u_time * 1.3 * modifier)) + .01) * box(st, vec2(0.05));

    gl_FragColor = vec4(vec3(color), opacity);
}
