import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { GalleryItem } from "./components/GalleryItem";
import { GlslModal } from "./components/GlslModal";
import { GameOfLife } from "./components/gallery/GameOfLife";
import { ColorAutomata } from "./components/gallery/ColorAutomata";

const FullScreenAutomata = ({ shaders }) => (
  <ColorAutomata
    name="Color Automata (WIP)"
    imgSrc="./frag/color-automata/color-automata.png"
    code={{
      copyShader: shaders["frag/copy.frag"],
      displayShader: shaders["frag/display.frag"],
      velocityShader: shaders["frag/color-automata/velocity.frag"],
      positionShader: shaders["frag/color-automata/position.frag"],
      invertVelocityShader: shaders["frag/color-automata/invert-velocity.frag"],
      neighborAverageShader:
        shaders["frag/color-automata/neighbor-average.frag"],
      separationShader: shaders["frag/color-automata/separation.frag"]
    }}
    width={window.innerWidth}
    height={window.innerHeight}
  />
);

const ColorGrid = ({ shaders }) => (
  <GlslModal
    name="256 colors"
    imgSrc="./frag/256-colors.png"
    display={{ fullscreen: "square" }}
    code={{ fragmentShader: shaders["frag/256-colors.frag"] }}
    onClick={() => null}
  />
);

const FullScreenGliderGun = ({ shaders }) => (
  <GameOfLife
    display={{
      width: `${window.innerHeight}px`,
      height: `${window.innerHeight}px`
    }}
    code={{
      displayShader: shaders["frag/display.frag"],
      stepShader: shaders["frag/game-of-life/game-of-life.frag"]
    }}
  />
);

class Gallery extends Component {
  render() {
    const { shaders } = this.props;
    return (
      <div>
        <Link to="/256-colors">
          <GalleryItem
            name="256 colors"
            imgSrc="./frag/256-colors.png"
            code={{ fragmentShader: shaders["frag/256-colors.frag"] }}
          />
        </Link>
        <Link to="/glider-gun">
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
        </Link>
        <Link to="/color-automata">
          <GalleryItem
            name="Color Automata"
            imgSrc="./frag/color-automata/color-automata.png"
            code={{
              copyShader: shaders["frag/copy.frag"],
              displayShader: shaders["frag/display.frag"],
              velocityShader: shaders["frag/color-automata/velocity.frag"],
              positionShader: shaders["frag/color-automata/position.frag"],
              invertVelocityShader:
                shaders["frag/color-automata/invert-velocity.frag"],
              neighborAverageShader:
                shaders["frag/color-automata/neighbor-average.frag"],
              separationShader: shaders["frag/color-automata/separation.frag"]
            }}
            preview={props => <ColorAutomata {...props} />}
            full={() => null}
          />
        </Link>
      </div>
    );
  }
}

const AppRouter = ({ shaders }) => (
  <Router>
    <div>
      <Route path="/" exact render={() => <Gallery shaders={shaders} />} />
      <Route
        path="/256-colors/"
        render={() => <ColorGrid shaders={shaders} />}
      />
      <Route
        path="/glider-gun/"
        render={() => <FullScreenGliderGun shaders={shaders} />}
      />
      <Route
        path="/color-automata/"
        render={() => <FullScreenAutomata shaders={shaders} />}
      />
    </div>
  </Router>
);

export default AppRouter;
