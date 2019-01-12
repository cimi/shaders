import React from "react";

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
    const textures = [];
    const buffers = [];
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
    // console.log(this.textures, this.buffers);
  }

  swap() {
    this.active = 1 - this.active;
  }

  nextVelocityTextureUnit() {
    // return this.active === 1 ? 3 : 2;
    return 3;
  }

  nextPositionTextureUnit() {
    return this.active === 1 ? 1 : 0;
  }

  prevVelocityTextureUnit() {
    // return this.active === 1 ? 2 : 3;
    return 2;
  }

  prevPositionTextureUnit() {
    return this.active === 1 ? 0 : 1;
  }

  nextVelocityFrameBuffer() {
    return this.buffers.velocity[1];
  }

  prevVelocityFrameBuffer() {
    return this.buffers.velocity[0];
  }

  positionFrameBuffer() {
    return this.buffers.position[this.active];
  }
}

const createColorAutomata = (canvasEl, code, { width, height }) => {
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
  const invertVelocityFragShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    code.invertVelocityShader
  );

  const neighborAverageFragShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    code.neighborAverageShader
  );

  const velocityProg = createProgram(gl, vertexShader, velocityFragShader);
  const positionProg = createProgram(gl, vertexShader, positionFragShader);
  const invertVelocityProg = createProgram(
    gl,
    vertexShader,
    invertVelocityFragShader
  );
  const neighborAverageProg = createProgram(
    gl,
    vertexShader,
    neighborAverageFragShader
  );
  const displayProg = createProgram(gl, vertexShader, displayFragShader);
  // gl.useProgram(velocityProg);

  const velocityProgCoordLoc = gl.getAttribLocation(velocityProg, "coord");
  const positionProgCoordLoc = gl.getAttribLocation(positionProg, "coord");
  const invertVelocityProgCoordLoc = gl.getAttribLocation(
    invertVelocityProg,
    "coord"
  );
  const neighborAverageProgCoordLoc = gl.getAttribLocation(
    neighborAverageProg,
    "coord"
  );

  const velocityUniforms = [
    gl.getUniformLocation(velocityProg, "previousPosition"),
    gl.getUniformLocation(velocityProg, "previousVelocity"),
    gl.getUniformLocation(velocityProg, "size"),
    gl.getUniformLocation(velocityProg, "u_time")
  ];

  const positionUniforms = [
    gl.getUniformLocation(positionProg, "previousPosition"),
    gl.getUniformLocation(positionProg, "currentVelocity"),
    gl.getUniformLocation(positionProg, "size")
  ];

  const invertVelocityUniforms = [
    gl.getUniformLocation(invertVelocityProg, "positionTex"),
    gl.getUniformLocation(invertVelocityProg, "velocityTex"),
    gl.getUniformLocation(invertVelocityProg, "size")
  ];

  const neighborAverageUniforms = [
    gl.getUniformLocation(neighborAverageProg, "tex"),
    gl.getUniformLocation(neighborAverageProg, "size")
  ];

  const displayUniforms = [
    gl.getUniformLocation(displayProg, "state"),
    gl.getUniformLocation(displayProg, "size")
  ];

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

  const automata = new Automata(gl, { width, height });
  const nextFrame = function() {
    // console.time("frame");

    // console.time("update velocity");
    gl.bindFramebuffer(gl.FRAMEBUFFER, automata.nextVelocityFrameBuffer());
    gl.useProgram(velocityProg);
    gl.enableVertexAttribArray(velocityProgCoordLoc);
    gl.uniform1i(velocityUniforms[0], automata.prevPositionTextureUnit());
    gl.uniform1i(velocityUniforms[1], automata.prevVelocityTextureUnit());
    gl.uniform2f(velocityUniforms[2], gl.canvas.width, gl.canvas.height);
    gl.uniform1f(velocityUniforms[3], performance.now() / 1000);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);
    // console.timeEnd("update velocity");

    // console.time("update position");
    gl.bindFramebuffer(gl.FRAMEBUFFER, automata.positionFrameBuffer());
    gl.useProgram(positionProg);
    gl.enableVertexAttribArray(positionProgCoordLoc);
    gl.uniform1i(positionUniforms[0], automata.prevPositionTextureUnit());
    gl.uniform1i(positionUniforms[1], automata.nextVelocityTextureUnit());
    gl.uniform2f(positionUniforms[2], gl.canvas.width, gl.canvas.height);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);
    // console.timeEnd("update position");

    // update the velocity buffer again to invert it if the particle touches a cube edge
    gl.bindFramebuffer(gl.FRAMEBUFFER, automata.prevVelocityFrameBuffer());
    gl.useProgram(invertVelocityProg);
    gl.enableVertexAttribArray(invertVelocityProgCoordLoc);
    gl.uniform1i(invertVelocityUniforms[0], automata.nextVelocityTextureUnit());
    gl.uniform1i(invertVelocityUniforms[1], automata.nextPositionTextureUnit());
    gl.uniform2f(invertVelocityUniforms[2], gl.canvas.width, gl.canvas.height);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

    // compute neighbor average to the screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(neighborAverageProg);
    gl.enableVertexAttribArray(neighborAverageProgCoordLoc);
    gl.uniform1i(
      neighborAverageUniforms[0],
      automata.nextVelocityTextureUnit()
    );
    gl.uniform2f(neighborAverageUniforms[1], gl.canvas.width, gl.canvas.height);
    gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

    // console.time("update display");
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // gl.useProgram(displayProg);

    // gl.uniform1i(displayUniforms[0], automata.nextPositionTextureUnit());
    // gl.uniform2f(displayUniforms[1], gl.canvas.width, gl.canvas.height);
    // gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);
    // console.timeEnd("update display");

    automata.swap();
    // console.timeEnd("frame");
  };
  return { automata, nextFrame };
};
