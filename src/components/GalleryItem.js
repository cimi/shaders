import React from "react";
import PropTypes from "prop-types";
import { GlslCanvas } from "./GlslCanvas";
import { GlslModal } from "./GlslModal";
import { Thumbnail } from "./Thumbnail";

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
    const { name, imgSrc, preview, full } = this.props;
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
          preview(this.props)
        ) : (
          <Thumbnail
            imgSrc={imgSrc}
            name={name}
            width={width}
            height={height}
          />
        )}
        <div className="credits">
          <p className="author label">{author}</p>
          <p className="title label">{name}</p>
        </div>
      </div>
    );
    return fullscreen ? (
      <span>
        {full(this.props, this.handleClick)}
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
    width: "256px",
    height: "256px",
    fullscreen: "square"
  },
  attribution: {},
  preview: props => <GlslCanvas {...props} />,
  full: (props, onClick) => <GlslModal {...props} onClick={onClick} />
};
