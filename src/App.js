import React, { Component } from "react";
import { GalleryItem } from "./components/GalleryItem";
import { GameOfLife } from "./components/gallery/GameOfLife";
import { ColorAutomata } from "./components/gallery/ColorAutomata";

class App extends Component {
  render() {
    const { shaders } = this.props;
    return (
      <div className="App">
        <GalleryItem
          name="256 colors"
          imgSrc="./frag/256-colors.png"
          code={{ fragmentShader: shaders[0] }}
        />
        <GalleryItem
          name="Glider gun"
          imgSrc="./frag/game-of-life/glider-gun.png"
          code={{ displayShader: shaders[1], stepShader: shaders[2] }}
          preview={props => <GameOfLife {...props} />}
          full={() => null}
        />
        <GalleryItem
          name="Color Automata (WIP)"
          imgSrc="./frag/color-automata/color-automata.png"
          code={{
            displayShader: shaders[3],
            velocityShader: shaders[5],
            positionShader: shaders[4]
          }}
          preview={props => <ColorAutomata {...props} />}
          full={() => null}
        />
      </div>
    );
  }
}

export default App;
