import React, { ReactElement } from "react";

import "./loader.scss";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {}

export function Loader(props: Props) {
  return (
    <span className={`loader loader_blink ${props.className || ""}`}></span>
  );
}
