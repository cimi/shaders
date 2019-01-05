export const DEFAULT_VERTEX_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif
attribute vec2 a_position;
attribute vec2 a_texcoord;
varying vec2 v_texcoord;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
}
`;

export const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program", gl.getProgramInfoLog(program));
  }
  return program;
};

export const createShader = (gl, type, src) => {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(
      "Could not compile shader",
      type,
      src,
      gl.getShaderInfoLog(s)
    );
  }
  return s;
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const randomImage = ({ width, height }) => {
  let buffer = [];
  for (let i = 0; i < width * height * 3; i++) {
    buffer[i] = randomInt(0, 255);
  }
  return new Uint8Array(buffer);
};
export const blankImage = ({ width, height }) => {
  let buffer = new Uint8Array(3 * width * height);
  buffer.fill(0, 0, buffer.length);
  return buffer;
};

export const loadImage = src => {
  const img = new Image();
  const promise = new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
  });
  img.src = src;
  return promise;
};

export const createTexture = (gl, textureUnit, image, { width, height }) => {
  const texture = gl.createTexture();
  gl.activeTexture(textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    width,
    height,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    image
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
};
