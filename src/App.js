import React, { Component } from "react";
import { GalleryItem } from "./GalleryItem";
import { GameOfLife } from "./GameOfLife";
import "./App.css";

class App extends Component {
  render() {
    const { shaders } = this.props;
    return (
      <div className="App">
        <GalleryItem
          name="256 colors"
          attribution={{ author: "Alex Ciminian" }}
          imgSrc="./frag/256-colors.png"
          code={{ fragmentShader: shaders[0] }}
        />
        <GalleryItem
          name="257 colors"
          attribution={{ author: "Alex Ciminian" }}
          display={{ width: "250px", height: "250px", fullscreen: "fill" }}
          imgSrc="./frag/256-colors.png"
          code={{ fragmentShader: shaders[0] }}
        />
        <GameOfLife
          code={{ displayShader: shaders[1], stepShader: shaders[2] }}
        />
      </div>
    );
  }
}

export default App;
