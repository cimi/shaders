import React from "react";
import classNames from "classnames";

import { GlslCanvas } from "./GlslCanvas";

export class GlslModal extends React.Component {
  render() {
    const { onClick } = this.props;
    const { fullscreen } = this.props.display;
    const display = {};
    if (fullscreen === "square") {
      // hardcoding for the 256-colors shader
      const margin = 25;
      const edge =
        window.innerHeight - margin - ((window.innerHeight - margin) % 256);
      display.width = edge + "px";
      display.height = edge + "px";
    } else if (fullscreen === "fill") {
      display.width = "100%";
      display.height = "100%";
    }
    const modalProps = Object.assign({}, this.props, { display });
    const cssClasses = classNames("gallery-modal", fullscreen);
    return (
      <div className={cssClasses} onClick={onClick}>
        <GlslCanvas {...modalProps} />
      </div>
    );
  }
}
