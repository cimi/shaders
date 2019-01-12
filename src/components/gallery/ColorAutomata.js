import React from "react";
import _ from "lodash";

import {
  createProgram,
  createShader,
  createTexture,
  randomImage,
  blankImage
} from "../../utils";

export class ColorAutomata extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    const { code, width, height } = this.props;
    const { nextFrame } = createColorAutomata(this.canvasRef.current, code, {
      width,
      height
    });
    const step = () => {
      // console.time("step");
      nextFrame();
      this.animationFrameReq = requestAnimationFrame(step);
      // console.timeEnd("step");
    };
    requestAnimationFrame(step);
  }

  componentWillUnmount() {
    // console.log("Clearing animation frame request ", this.animationFrameReq);
    cancelAnimationFrame(this.animationFrameReq);
  }

  render() {
    const { width, height } = this.props;
    return (
      <canvas
        width={width}
        height={height}
        ref={this.canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    );
  }
}

ColorAutomata.defaultProps = {
  width: 256,
  height: 256
};

class Automata {
  constructor(gl, { width, height }) {
    this.active = 1;
    this.frameBuffers = [];
    const seed = randomImage({ width, height });
    for (let idx = 0; idx < 6; idx++) {
      const image = idx < 1 ? seed : blankImage({ width, height });
      const texture = createTexture(gl, gl[`TEXTURE${idx}`], image, {
        width,
        height
      });
      const buffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
      this.frameBuffers.push({ textureUnit: idx, frameBuffer: buffer });
    }
  }

  swap() {
    this.active = 1 - this.active;
  }

  textureUnit(id) {
    switch (id) {
      case "prevPosition":
        return this.active ? 0 : 1;
      case "prevVelocity":
        return 2;
      case "nextPosition":
        return this.active ? 1 : 0;
      case "nextVelocity":
        return 3;
      default:
        throw new Error("id not recognized");
    }
  }

  frameBuffer(id) {
    return this.frameBuffers[this.textureUnit(id)].frameBuffer;
  }
}

const createVertexShader = gl => {
  return createShader(
    gl,
    gl.VERTEX_SHADER,
    "attribute vec2 coord; void main(void) { gl_Position = vec4(coord, 0.0, 1.0); }"
  );
};

const gpgpu = (gl, options) => {
  const { shaderCode, uniformDefinitions } = options;
  const vertexShader = createVertexShader(gl);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderCode);
  const program = createProgram(gl, vertexShader, fragmentShader);
  const coordLoc = gl.getAttribLocation(program, "coord");

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
  gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);

  const elementBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint8Array([0, 1, 2, 3]),
    gl.STATIC_DRAW
  );

  const mappedUniforms = _.mapValues(uniformDefinitions, (props, name) =>
    Object.assign(props, { loc: gl.getUniformLocation(program, name) })
  );

  return (frameBuffer, uniforms) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.useProgram(program);
    gl.enableVertexAttribArray(coordLoc);
    _.forOwn(mappedUniforms, (props, name) => {
      gl[props.type](props.loc, ...uniforms[name]);
    });
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);
  };
};

const createColorAutomata = (canvasEl, code, { width, height }) => {
  const gl = canvasEl.getContext("webgl");

  const updateVelocity = gpgpu(gl, {
    shaderCode: code.velocityShader,
    uniformDefinitions: {
      previousPosition: { type: "uniform1i" },
      previousVelocity: { type: "uniform1i" },
      size: { type: "uniform2f" },
      time: { type: "uniform1f" }
    }
  });

  const updatePosition = gpgpu(gl, {
    shaderCode: code.positionShader,
    uniformDefinitions: {
      previousPosition: { type: "uniform1i" },
      currentVelocity: { type: "uniform1i" },
      size: { type: "uniform2f" }
    }
  });

  const invertVelocity = gpgpu(gl, {
    shaderCode: code.invertVelocityShader,
    uniformDefinitions: {
      positionTex: { type: "uniform1i" },
      velocityTex: { type: "uniform1i" },
      size: { type: "uniform2f" }
    }
  });

  const neighborAverage = gpgpu(gl, {
    shaderCode: code.neighborAverageShader,
    uniformDefinitions: {
      tex: { type: "uniform1i" },
      size: { type: "uniform2f" }
    }
  });

  const display = gpgpu(gl, {
    shaderCode: code.displayShader,
    uniformDefinitions: {
      state: { type: "uniform1i" },
      size: { type: "uniform2f" }
    }
  });

  const automata = new Automata(gl, { width, height });
  const nextFrame = function() {
    updateVelocity(automata.frameBuffer("nextVelocity"), {
      previousPosition: [automata.textureUnit("prevPosition")],
      previousVelocity: [automata.textureUnit("prevVelocity")],
      size: [gl.canvas.width, gl.canvas.height],
      time: [performance.now() / 1000]
    });

    updatePosition(automata.frameBuffer("nextPosition"), {
      previousPosition: [automata.textureUnit("prevPosition")],
      currentVelocity: [automata.textureUnit("nextVelocity")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    invertVelocity(automata.frameBuffer("prevVelocity"), {
      positionTex: [automata.textureUnit("nextPosition")],
      velocityTex: [automata.textureUnit("nextVelocity")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    display(null, {
      state: [automata.textureUnit("nextPosition")],
      size: [gl.canvas.width, gl.canvas.height]
    });
    automata.swap();

    // display(null, { });
  };
  return { automata, nextFrame };
};
