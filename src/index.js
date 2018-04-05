import React from "react";
import ReactDOM from "react-dom";

import "./index.css";

import App from "./App";

const automata = [
  "frag/color-automata/",
  "frag/randoms/random-lightning/",
  "frag/randoms/nice-noise/",
  "frag/randoms/maze-automata/"
];
const shaderVariants = ["display", "velocity", "position"];
const automataShaders = automata
  .map(path => shaderVariants.map(variant => `${path}${variant}.frag`))
  .reduce((acc, shaders) => acc.concat(shaders), []);
console.log(automataShaders);
const promises = [
  "frag/256-colors.frag",
  "frag/game-of-life/display.frag",
  "frag/game-of-life/game-of-life.frag"
]
  .concat(automataShaders)
  .map(frag =>
    fetch(frag)
      .then(response => response.text())
      .then(responseText => ({ [frag]: responseText }))
  );

Promise.all(promises).then(shaders => {
  console.log(shaders);
  ReactDOM.render(
    <App shaders={Object.assign({}, ...shaders)} />,
    document.getElementById("root")
  );
});
