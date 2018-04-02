import React, { Component } from "react";
import { GalleryItem } from "./GalleryItem";
import { GameOfLife } from "./GameOfLife";
import { ColorAutomata } from "./ColorAutomata";
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
          name="Glider gun"
          attribution={{ author: "Jim Fisher" }}
          imgSrc="./frag/256-colors.png"
          code={{ displayShader: shaders[1], stepShader: shaders[2] }}
          preview={props => <GameOfLife {...props} />}
        />
        <GalleryItem
          name="Color Automata (WIP)"
          attribution={{ author: "Alex Ciminian" }}
          imgSrc="./frag/256-colors.png"
          code={{
            displayShader: shaders[3],
            velocityShader: shaders[5],
            positionShader: shaders[4]
          }}
          preview={props => <ColorAutomata {...props} />}
        />
      </div>
    );
  }
}

export default App;
