import React, { Component } from "react";
import { GalleryItem } from "./components/GalleryItem";
import { GameOfLife } from "./components/gallery/GameOfLife";
import { ColorAutomata } from "./components/gallery/ColorAutomata";
import { RandomLightning } from "./components/gallery/randoms/RandomLightning";
import { NiceNoise } from "./components/gallery/randoms/NiceNoise";

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
            displayShader: shaders["frag/game-of-life/display.frag"],
            stepShader: shaders["frag/game-of-life/game-of-life.frag"]
          }}
          preview={props => <GameOfLife {...props} />}
          full={() => null}
        />
        <GalleryItem
          name="Color Automata (WIP)"
          imgSrc="./frag/color-automata/color-automata.png"
          code={{
            displayShader: shaders["frag/color-automata/display.frag"],
            velocityShader: shaders["frag/color-automata/velocity.frag"],
            positionShader: shaders["frag/color-automata/position.frag"]
          }}
          preview={props => <ColorAutomata {...props} />}
          full={() => null}
        />
        <br />
        <GalleryItem
          name="Random Lightning"
          imgSrc="./frag/color-automata/color-automata.png"
          code={{
            displayShader:
              shaders["frag/randoms/random-lightning/display.frag"],
            velocityShader:
              shaders["frag/randoms/random-lightning/velocity.frag"],
            positionShader:
              shaders["frag/randoms/random-lightning/position.frag"]
          }}
          preview={props => <RandomLightning {...props} />}
          full={() => null}
        />
        <GalleryItem
          name="Nice Noise"
          imgSrc="./frag/color-automata/color-automata.png"
          code={{
            displayShader: shaders["frag/randoms/nice-noise/display.frag"],
            velocityShader: shaders["frag/randoms/nice-noise/velocity.frag"],
            positionShader: shaders["frag/randoms/nice-noise/position.frag"]
          }}
          preview={props => <NiceNoise {...props} />}
          full={() => null}
        />
        <GalleryItem
          name="Maze Automata"
          imgSrc="./frag/color-automata/color-automata.png"
          code={{
            displayShader: shaders["frag/randoms/maze-automata/display.frag"],
            velocityShader: shaders["frag/randoms/maze-automata/velocity.frag"],
            positionShader: shaders["frag/randoms/maze-automata/position.frag"]
          }}
          preview={props => <NiceNoise {...props} />}
          full={() => null}
        />
      </div>
    );
  }
}

export default App;
