import React from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

export const FadeIn = ({ children }) => (
  <ReactCSSTransitionGroup
    transitionName="fade"
    transitionAppear={true}
    transitionAppearTimeout={500}
    transitionEnter={false}
    transitionLeave={false}
  >
    {children}
  </ReactCSSTransitionGroup>
);
