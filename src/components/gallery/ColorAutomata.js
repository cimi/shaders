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
    const { code } = this.props;
    const { nextFrame } = createColorAutomata(
      this.canvasRef.current,
      code,
      this.props
    );
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
  height: 256,
  velocityEase: 0.16,
  invertBounce: 1,
  cohesionWeight: 1.6,
  alignmentWeight: 0.8,
  separationWeight: 4,
  separationThreshold: 1 / 16,
  velocityWeight: 0.98
};

class Automata {
  constructor(gl, { width, height }) {
    this.active = 1;
    this.frameBuffers = [];
    const seed = randomImage({ width, height });
    for (let idx = 0; idx < 8; idx++) {
      const image = idx <= 1 ? seed : blankImage({ width, height });
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
      case "colorBuffer":
        return 0;
      case "colorPrimary":
        return 1;
      case "velocityBuffer":
        return 2;
      case "velocityPrimary":
        return 3;
      case "cohesion":
        return 4;
      case "alignment":
        return 5;
      case "separation":
        return 6;
      case "aux":
        return 7;
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

const toArray = value => (_.isArray(value) ? value : [value]);
const gpgpu = (gl, options) => {
  const { shaderCode, uniformDefinitions } = options;
  const vertexShader = createVertexShader(gl);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaderCode);
  const program = createProgram(gl, vertexShader, fragmentShader);
  const coordLoc = gl.getAttribLocation(program, "coord");

  const vertexBuffer = gl.createBuffer();
  const vertexArray = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

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
      gl[props.type](props.loc, ...toArray(uniforms[name]));
    });
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);
  };
};

const createColorAutomata = (canvasEl, code, options) => {
  const gl = canvasEl.getContext("webgl");
  const { width, height } = options;
  const updateVelocity = gpgpu(gl, {
    shaderCode: code.velocityShader,
    uniformDefinitions: {
      previousVelocity: { type: "uniform1i" },
      alignment: { type: "uniform1i" },
      cohesion: { type: "uniform1i" },
      separation: { type: "uniform1i" },
      size: { type: "uniform2f" },
      velocityWeight: { type: "uniform1f" },
      alignmentWeight: { type: "uniform1f" },
      cohesionWeight: { type: "uniform1f" },
      separationWeight: { type: "uniform1f" },
      velocityEase: { type: "uniform1f" }
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
      size: { type: "uniform2f" },
      invertBounce: { type: "uniform1f" }
    }
  });

  const neighborAverage = gpgpu(gl, {
    shaderCode: code.neighborAverageShader,
    uniformDefinitions: {
      tex: { type: "uniform1i" },
      size: { type: "uniform2f" }
    }
  });

  const separation = gpgpu(gl, {
    shaderCode: code.separationShader,
    uniformDefinitions: {
      tex: { type: "uniform1i" },
      size: { type: "uniform2f" },
      separationThreshold: { type: "uniform1f" }
    }
  });

  const copy = gpgpu(gl, {
    shaderCode: code.copyShader,
    uniformDefinitions: {
      tex: { type: "uniform1i" },
      size: { type: "uniform2f" }
    }
  });

  const display = gpgpu(gl, {
    shaderCode: code.displayShader,
    uniformDefinitions: {
      tex: { type: "uniform1i" },
      size: { type: "uniform2f" }
    }
  });

  const automata = new Automata(gl, { width, height });
  const {
    invertBounce,
    separationThreshold,
    alignmentWeight,
    cohesionWeight,
    separationWeight,
    velocityEase,
    velocityWeight
  } = options;
  console.log(options);
  const nextFrame = function() {
    neighborAverage(automata.frameBuffer("cohesion"), {
      tex: [automata.textureUnit("colorPrimary")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    neighborAverage(automata.frameBuffer("alignment"), {
      tex: [automata.textureUnit("velocityPrimary")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    separation(automata.frameBuffer("separation"), {
      tex: [automata.textureUnit("colorPrimary")],
      size: [gl.canvas.width, gl.canvas.height],
      separationThreshold
    });

    updateVelocity(automata.frameBuffer("velocityBuffer"), {
      previousVelocity: [automata.textureUnit("velocityPrimary")],
      alignment: [automata.textureUnit("alignment")],
      cohesion: [automata.textureUnit("cohesion")],
      separation: [automata.textureUnit("separation")],
      size: [gl.canvas.width, gl.canvas.height],
      time: [performance.now() / 1000],
      alignmentWeight,
      separationWeight,
      cohesionWeight,
      velocityEase,
      velocityWeight
    });

    invertVelocity(automata.frameBuffer("aux"), {
      positionTex: [automata.textureUnit("colorBuffer")],
      velocityTex: [automata.textureUnit("velocityBuffer")],
      size: [gl.canvas.width, gl.canvas.height],
      invertBounce
    });

    copy(automata.frameBuffer("velocityBuffer"), {
      tex: [automata.textureUnit("aux")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    updatePosition(automata.frameBuffer("aux"), {
      previousPosition: [automata.textureUnit("colorBuffer")],
      currentVelocity: [automata.textureUnit("velocityBuffer")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    copy(automata.frameBuffer("colorBuffer"), {
      tex: [automata.textureUnit("aux")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    copy(automata.frameBuffer("velocityPrimary"), {
      tex: [automata.textureUnit("velocityBuffer")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    copy(automata.frameBuffer("colorPrimary"), {
      tex: [automata.textureUnit("colorBuffer")],
      size: [gl.canvas.width, gl.canvas.height]
    });

    display(null, {
      tex: [automata.textureUnit("colorPrimary")],
      size: [gl.canvas.width, gl.canvas.height]
    });
  };
  return { automata, nextFrame };
};
