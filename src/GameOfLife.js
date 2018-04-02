import React from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import PropTypes from "prop-types";
import classNames from "classnames";

export class GameOfLife extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    const { code } = this.props;
    createGameOfLife(this.canvasRef.current, code);
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

const createTexture = (gl, activeTexture, image) => {
  const texture = gl.createTexture();
  gl.activeTexture(activeTexture);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
};

const createGameOfLife = (canvasEl, code) => {
  const startStateImg = new Image();
  startStateImg.onload = function() {
    const gl = canvasEl.getContext("webgl");

    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      "attribute vec2 coord; void main(void) { gl_Position = vec4(coord, 0.0, 1.0); }"
    );
    const fragShaderDisplay = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      code.displayShader
    );
    const fragShaderStepper = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      code.stepShader
    );

    const displayProg = createProgram(gl, vertexShader, fragShaderDisplay);
    const stepperProg = createProgram(gl, vertexShader, fragShaderStepper);

    gl.useProgram(stepperProg);

    const stepperProgCoordLoc = gl.getAttribLocation(stepperProg, "coord");
    const stepperProgPreviousStateLoc = gl.getUniformLocation(
      stepperProg,
      "previousState"
    );

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
    gl.vertexAttribPointer(stepperProgCoordLoc, 2, gl.FLOAT, false, 0, 0);

    const elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array([0, 1, 2, 3]),
      gl.STATIC_DRAW
    );

    const texture0 = createTexture(gl, gl.TEXTURE0, startStateImg);
    const texture1 = createTexture(gl, gl.TEXTURE0 + 1, startStateImg);

    const framebuffers = [gl.createFramebuffer(), gl.createFramebuffer()];

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture0,
      0
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture1,
      0
    );

    let nextStateIndex = 0;
    window.setInterval(function() {
      const previousStateIndex = 1 - nextStateIndex;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[nextStateIndex]);
      gl.useProgram(stepperProg);
      gl.enableVertexAttribArray(stepperProgCoordLoc);
      gl.uniform1i(stepperProgPreviousStateLoc, previousStateIndex);
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(displayProg);
      gl.uniform1i(displayProgStateLoc, nextStateIndex);
      gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

      nextStateIndex = previousStateIndex;
    }, 100);
  };

  startStateImg.src = "frag/game-of-life/start-state.png";
};
