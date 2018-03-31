import React, { Component } from "react";
import { GalleryItem } from "./GalleryItem";
import "./App.css";

class App extends Component {
  render() {
    const { code } = this.props;
    return (
      <div className="App">
        <GalleryItem
          name="256 colors"
          attribution={{ author: "Alex Ciminian" }}
          imgSrc="./frag/256-colors.png"
          code={code}
        />
        <GalleryItem
          name="257 colors"
          attribution={{ author: "Alex Ciminian" }}
          display={{ width: "250px", height: "250px", fullscreen: "fill" }}
          imgSrc="./frag/256-colors.png"
          code={code}
        />
      </div>
    );
  }
}

export default App;
