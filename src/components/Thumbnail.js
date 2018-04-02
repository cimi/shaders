import React from "react";

import { FadeIn } from "./FadeIn";

export const Thumbnail = ({ imgSrc, name }) => (
  <FadeIn>
    <img src={imgSrc} className="glslGallery_thumb" alt={name} />
  </FadeIn>
);
