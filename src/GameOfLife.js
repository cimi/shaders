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
        width="250px"
        height="250px"
        data-fragment={fragmentShader}
        data-vertex={vertexShader}
        ref={this.canvasRef}
      />
    );
  }
}

const createGameOfLife = (canvasEl, code) => {
  const startStateImg = new Image();
  startStateImg.onload = function() {
    const gl = canvasEl.getContext("webgl");

    function createShader(ty, src) {
      const s = gl.createShader(ty);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(
          "Could not compile shader",
          ty,
          src,
          gl.getShaderInfoLog(s)
        );
      }
      return s;
    }
    const vertexShader = createShader(
      gl.VERTEX_SHADER,
      "attribute vec2 coord; void main(void) { gl_Position = vec4(coord, 0.0, 1.0); }"
    );
    const fragShaderDisplay = createShader(
      gl.FRAGMENT_SHADER,
      code.displayShader
    );
    const fragShaderStepper = createShader(gl.FRAGMENT_SHADER, code.stepShader);

    function createProgram(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error("Error linking program", gl.getProgramInfoLog(p));
      }
      return p;
    }
    const displayProg = createProgram(vertexShader, fragShaderDisplay);
    const stepperProg = createProgram(vertexShader, fragShaderStepper);

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

    const texture0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      startStateImg
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    const texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      startStateImg
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

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
