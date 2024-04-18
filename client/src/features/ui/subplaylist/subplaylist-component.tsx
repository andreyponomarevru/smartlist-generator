import React from "react";

interface SubplaylistProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Subplaylist(props: SubplaylistProps) {
  return (
    <ol className={`subplaylist ${props.className || ""}`}>{props.children}</ol>
  );
}
