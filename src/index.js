import React from "react";
import ReactDOM from "react-dom";

import "./index.css";

import App from "./App";
import { showFpsCounter } from "./stats";
import { loadShaders } from "./loader";

showFpsCounter(true);

loadShaders().then(shaders => {
  ReactDOM.render(<App shaders={shaders} />, document.getElementById("root"));
});
