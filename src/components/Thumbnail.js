import React from "react";

import { FadeIn } from "./FadeIn";

export const Thumbnail = ({ imgSrc, name, width, height }) => (
  <FadeIn>
    <img src={imgSrc} alt={name} width={width} height={height} />
  </FadeIn>
);
