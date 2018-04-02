import React from "react";
import PropTypes from "prop-types";
import webglCanvas from "glslCanvas";

import { DEFAULT_VERTEX_SHADER } from "../utils";
import { FadeIn } from "./FadeIn";

export class GlslCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  initCanvas() {
    const canvas = this.canvasRef.current;
    const { fragmentShader } = this.props.code;
    const { width, height } = this.props.display;
    this.glslCanvas = new webglCanvas(canvas);
    this.glslCanvas.load(fragmentShader);
    canvas.style.width = width;
    canvas.style.height = height;
  }

  componentDidMount() {
    this.initCanvas();
  }

  render() {
    const { width, height } = this.props.display;
    const { fragmentShader, vertexShader } = this.props.code;
    return (
      <FadeIn>
        <canvas
          width={width}
          height={height}
          data-fragment={fragmentShader}
          data-vertex={vertexShader}
          ref={this.canvasRef}
        />
      </FadeIn>
    );
  }
}
GlslCanvas.propTypes = {
  code: PropTypes.shape({
    fragmentShader: PropTypes.string.isRequired,
    vertexShader: PropTypes.string,
    textures: PropTypes.arrayOf(PropTypes.string)
  })
};
GlslCanvas.defaultProps = {
  code: {
    vertexShader: DEFAULT_VERTEX_SHADER,
    textures: []
  }
};
