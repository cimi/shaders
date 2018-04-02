import React from "react";
import PropTypes from "prop-types";
import { GlslCanvas } from "./components/GlslCanvas";
import { GlslModal } from "./components/GlslModal";
import { Thumbnail } from "./components/Thumbnail";

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
          <GlslCanvas {...this.props} />
        ) : (
          <Thumbnail imgSrc={imgSrc} name={name} />
        )}
        <div className="credits">
          <p className="author label">{author}</p>
          <p className="title label">{name}</p>
        </div>
      </div>
    );
    const modal = <GlslModal {...this.props} onClick={this.handleClick} />;
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
