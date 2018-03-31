import React from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import PropTypes from "prop-types";
import classNames from "classnames";
import GlslCanvas from "glslCanvas";

import { DEFAULT_VERTEX_SHADER } from "./utils";

class GlCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  initCanvas() {
    const canvas = this.canvasRef.current;
    const { fragmentShader } = this.props.code;
    const { width, height } = this.props.display;
    this.glslCanvas = new GlslCanvas(canvas);
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

GlCanvas.defaultProps = {
  code: {
    vertexShader: DEFAULT_VERTEX_SHADER,
    textures: []
  }
};

const FadeIn = ({ children }) => (
  <ReactCSSTransitionGroup
    transitionName="fade"
    transitionAppear={true}
    transitionAppearTimeout={500}
    transitionEnter={false}
    transitionLeave={false}
  >
    {children}
  </ReactCSSTransitionGroup>
);

class GlModal extends React.Component {
  render() {
    const { onClick } = this.props;
    const { fullscreen } = this.props.display;
    const display = {};
    if (fullscreen === "square") {
      display.width = window.innerHeight - 100 + "px";
      display.height = window.innerHeight - 100 + "px";
    } else if (fullscreen === "fill") {
      display.width = "100%";
      display.height = "100%";
    }
    const modalProps = Object.assign({}, this.props, { display });
    const cssClasses = classNames("gallery-modal", fullscreen);
    return (
      <div className={cssClasses} onClick={onClick}>
        <GlCanvas {...modalProps} />
      </div>
    );
  }
}

const Thumbnail = ({ imgSrc, name }) => (
  <FadeIn>
    <img src={imgSrc} className="glslGallery_thumb" alt={name} />
  </FadeIn>
);

export class GalleryItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = { active: false };
  }

  handleClick = e => {
    console.log("click", this.state);
    const { fullscreen } = this.state;
    this.setState({ fullscreen: !fullscreen, active: false });
  };

  handleMouseEnter = e => {
    console.log("enter");
    this.setState({ active: true });
  };

  handleMouseLeave = e => {
    console.log("leave");
    this.setState({ active: false });
  };

  render() {
    const { name, imgSrc } = this.props;
    const { width, height } = this.props.display;
    const { active, fullscreen } = this.state;
    const { author } = this.props.attribution;
    const item = (
      <div
        className="gallery-item"
        width={width}
        height={height}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {active ? (
          <GlCanvas {...this.props} />
        ) : (
          <Thumbnail imgSrc={imgSrc} name={name} />
        )}
        <div className="credits">
          <p className="author label">{author}</p>
          <p className="title label">{name}</p>
        </div>
      </div>
    );
    const modal = <GlModal {...this.props} onClick={this.handleClick} />;
    return fullscreen ? (
      <span>
        {modal}
        {item}
      </span>
    ) : (
      item
    );
  }
}

GalleryItem.propTypes = {
  name: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  code: PropTypes.shape({
    fragmentShader: PropTypes.string.isRequired,
    vertexShader: PropTypes.string,
    textures: PropTypes.arrayOf(PropTypes.string)
  }),
  display: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
    fullscreen: PropTypes.oneOf(["fill", "square"])
  }),
  attribution: PropTypes.shape({
    author: PropTypes.string,
    date: PropTypes.instanceOf(Date),
    credits: PropTypes.string,
    link: PropTypes.string
  })
};

GalleryItem.defaultProps = {
  display: {
    width: "250px",
    height: "250px",
    fullscreen: "square"
  },
  attribution: {}
};
