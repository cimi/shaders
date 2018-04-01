import React from "react";
import ReactDOM from "react-dom";

import "glslGallery/build/glslGallery.css";

import App from "./App";

const promises = [
  "frag/256-colors.frag",
  "frag/game-of-life/display.frag",
  "frag/game-of-life/game-of-life.frag"
].map(frag => fetch(frag).then(response => response.text()));
Promise.all(promises).then(shaders => {
  ReactDOM.render(<App shaders={shaders} />, document.getElementById("root"));
});
