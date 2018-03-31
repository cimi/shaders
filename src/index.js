import React from "react";
import ReactDOM from "react-dom";

import "glslGallery/build/glslGallery.css";

import App from "./App";

fetch("frag/256-colors.frag")
  .then(response => response.text())
  .then(fragmentShader => {
    const code = { fragmentShader };
    ReactDOM.render(<App code={code} />, document.getElementById("root"));
  });
