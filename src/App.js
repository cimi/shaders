import React, { Component } from "react";
import { GalleryItem } from "./components/GalleryItem";
import { GameOfLife } from "./components/gallery/GameOfLife";
import { ColorAutomata } from "./components/gallery/ColorAutomata";

class App extends Component {
  render() {
    const { shaders } = this.props;
    return (
      <div>
        <GalleryItem
          name="256 colors"
          imgSrc="./frag/256-colors.png"
          code={{ fragmentShader: shaders["frag/256-colors.frag"] }}
        />
        <GalleryItem
          name="Glider gun"
          imgSrc="./frag/game-of-life/glider-gun.png"
          code={{
            displayShader: shaders["frag/display.frag"],
            stepShader: shaders["frag/game-of-life/game-of-life.frag"]
          }}
          preview={props => <GameOfLife {...props} />}
          full={() => null}
        />
        <GalleryItem
          name="Color Automata (WIP)"
          imgSrc="./frag/color-automata/color-automata.png"
          code={{
            displayShader: shaders["frag/display.frag"],
            velocityShader: shaders["frag/color-automata/velocity.frag"],
            positionShader: shaders["frag/color-automata/position.frag"],
            invertVelocityShader:
              shaders["frag/color-automata/invert-velocity.frag"],
            neighborAverageShader:
              shaders["frag/color-automata/neighbor-average.frag"]
          }}
          preview={props => <ColorAutomata {...props} />}
          full={props => (
            <ColorAutomata {...props} width="1024" height="1024" />
          )}
        />
      </div>
    );
  }
}

export default App;
