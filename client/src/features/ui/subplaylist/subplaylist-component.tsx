import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export function Subplaylist(props: Props) {
  return (
    <ol className={`subplaylist ${props.className || ""}`}>{props.children}</ol>
  );
}
