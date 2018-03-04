// modified from https://thebookofshaders.com/09/

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265358979323846

vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 tile(vec2 _st, float _zoom){
    _st *= _zoom;
    return fract(_st);
}

float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = smoothstep(_size,_size+aa,_st);
    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
    return uv.x*uv.y;
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(st.x);
	float tileScaling = 5.;
    // Divide the space in 4
	float boxCount = tileScaling * tileScaling;
    float boxId = floor(st.x * tileScaling) + tileScaling * floor(st.y * tileScaling);
    st = tile(st, tileScaling);

    // Use a matrix to rotate the space 45 degrees
    // st = rotate2D(st,PI*cos(u_time));

    // Draw a square

    float boxModifier = (boxId + 1.) / boxCount;
    vec3 boxColor = vec3(abs(cos(boxModifier * u_time)), sin(boxModifier * u_time), cos(boxModifier * u_time * .5));
    float isBox = abs(sin(u_time * 1.3 * boxModifier)) * box(st, vec2(0.7), 0.01);
    color = vec3(isBox * boxColor);
    // color = vec3(st,0.0);

    gl_FragColor = vec4(color,1.0);
}
