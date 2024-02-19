import * as React from "react";

import { Loader } from "../loader/loader";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  name: string;
  theme:
    | "white"
    | "red"
    | "black"
    | "transparent-black"
    | "transparent-white"
    | "transparent-red";
  isLoading?: boolean;
}

export function Btn(props: Props): React.ReactElement {
  const className = `btn btn_theme_${props.theme} ${props.className || ""} ${
    props.isLoading ? "btn_disabled" : ""
  }`;

  const onClick = props.onClick ? props.onClick : undefined;

  return (
    <button onClick={onClick} className={className} disabled={props.isLoading}>
      <span>{props.name}</span>
      {props.isLoading && props.children}
    </button>
  );
}
