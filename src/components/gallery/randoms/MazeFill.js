import React from "react";

export class MazeFill extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    const { code } = this.props;
    createColorAutomata(this.canvasRef.current, code);
  }

  render() {
    const { fragmentShader, vertexShader } = this.props.code;
    return (
      <canvas
        width="64"
        height="64"
        data-fragment={fragmentShader}
        data-vertex={vertexShader}
        ref={this.canvasRef}
        style={{ width: "256px", height: "256px", imageRendering: "pixelated" }}
      />
    );
  }
}

const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program", gl.getProgramInfoLog(program));
  }
  return program;
};

const createShader = (gl, type, src) => {
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

const createTexture = (gl, textureUnit, image) => {
  const texture = gl.createTexture();
  gl.activeTexture(textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    64,
    64,
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const randomImage = () => {
  let buffer = [];
  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64; j++) {
      buffer = buffer.concat([
        randomInt(0, 255),
        randomInt(0, 255),
        randomInt(0, 255)
      ]);
    }
  }
  return new Uint8Array(buffer);
};
const blankImage = () => {
  let buffer = [];
  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64; j++) {
      buffer = buffer.concat([0, 0, 0]);
    }
  }
  return new Uint8Array(buffer);
};
class Automata {
  constructor(gl) {
    this.active = 0;
    const textures = [];
    const buffers = [];
    for (let idx = 0; idx < 4; idx++) {
      const image = idx < 2 ? randomImage() : blankImage();
      const texture = createTexture(gl, gl[`TEXTURE${idx}`], image);
      const buffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
      textures.push(texture);
      buffers.push(buffer);
    }
    this.textures = {
      position: textures.slice(0, 2),
      velocity: textures.slice(2)
    };
    this.buffers = {
      position: [buffers[0], buffers[1]],
      velocity: [buffers[2], buffers[3]]
    };
  }

  swap() {
    this.active = 1 - this.active;
  }

  nextVelocityTextureUnit() {
    return this.active === 1 ? 3 : 2;
  }

  nextPositionTextureUnit() {
    return this.active === 1 ? 1 : 0;
  }

  prevVelocityTextureUnit() {
    return this.active === 1 ? 2 : 3;
  }

  prevPositionTextureUnit() {
    return this.active === 1 ? 0 : 1;
  }

  velocityFrameBuffer() {
    return this.buffers.velocity[this.active];
  }

  positionFrameBuffer() {
    return this.buffers.position[this.active];
  }
}

const createColorAutomata = (canvasEl, code) => {
  const startStateImg = new Image();
  startStateImg.onload = function() {
    const gl = canvasEl.getContext("webgl");

    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      "attribute vec2 coord; void main(void) { gl_Position = vec4(coord, 0.0, 1.0); }"
    );
    const displayFragShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      code.displayShader
    );
    const velocityFragShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      code.velocityShader
    );
    const positionFragShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      code.positionShader
    );

    const velocityProg = createProgram(gl, vertexShader, velocityFragShader);
    const positionProg = createProgram(gl, vertexShader, positionFragShader);
    const displayProg = createProgram(gl, vertexShader, displayFragShader);

    gl.useProgram(velocityProg);

    const velocityProgCoordLoc = gl.getAttribLocation(velocityProg, "coord");
    const positionProgCoordLoc = gl.getAttribLocation(positionProg, "coord");

    const velocityUniforms = [
      gl.getUniformLocation(velocityProg, "previousPosition"),
      gl.getUniformLocation(velocityProg, "previousVelocity")
    ];

    const positionUniforms = [
      gl.getUniformLocation(positionProg, "previousPosition"),
      gl.getUniformLocation(positionProg, "currentVelocity")
    ];

    const displayProgCoordLoc = gl.getAttribLocation(displayProg, "coord");
    const displayProgStateLoc = gl.getUniformLocation(displayProg, "state");

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
      gl.STATIC_DRAW
    );

    // Note we must bind ARRAY_BUFFER before running vertexAttribPointer!
    // This is confusing and deserves a blog post
    // https://stackoverflow.com/questions/7617668/glvertexattribpointer-needed-everytime-glbindbuffer-is-called
    gl.vertexAttribPointer(velocityProgCoordLoc, 2, gl.FLOAT, false, 0, 0);

    const elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array([0, 1, 2, 3]),
      gl.STATIC_DRAW
    );

    const automata = new Automata(gl, startStateImg);
    window.setInterval(function() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, automata.velocityFrameBuffer());
      gl.useProgram(velocityProg);
      gl.enableVertexAttribArray(velocityProgCoordLoc);
      gl.uniform1i(velocityUniforms[0], automata.prevPositionTextureUnit());
      gl.uniform1i(velocityUniforms[1], automata.prevVelocityTextureUnit());
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

      gl.bindFramebuffer(gl.FRAMEBUFFER, automata.positionFrameBuffer());
      gl.useProgram(positionProg);
      gl.enableVertexAttribArray(positionProgCoordLoc);
      gl.uniform1i(positionUniforms[0], automata.prevPositionTextureUnit());
      gl.uniform1i(positionUniforms[1], automata.nextVelocityTextureUnit());
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(displayProg);
      gl.uniform1i(displayProgStateLoc, automata.nextPositionTextureUnit());
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

      automata.swap();
    }, 100);
  };

  startStateImg.src = "frag/game-of-life/start-state.png";
};
