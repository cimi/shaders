import React from "react";
import ReactDOM from "react-dom";

import "./index.css";

import App from "./App";
import { showFpsCounter } from "./stats";

const automata = ["frag/color-automata/"];
const shaderVariants = ["velocity", "position", "invert-velocity"];
const automataShaders = automata
  .map(path => shaderVariants.map(variant => `${path}${variant}.frag`))
  .reduce((acc, shaders) => acc.concat(shaders), []);

const promises = [
  "frag/256-colors.frag",
  "frag/display.frag",
  "frag/game-of-life/game-of-life.frag"
]
  .concat(automataShaders)
  .map(frag =>
    fetch(frag)
      .then(response => response.text())
      .then(responseText => ({ [frag]: responseText }))
  );

showFpsCounter(true);

Promise.all(promises).then(shaders => {
  ReactDOM.render(
    <App shaders={Object.assign({}, ...shaders)} />,
    document.getElementById("root")
  );
});
