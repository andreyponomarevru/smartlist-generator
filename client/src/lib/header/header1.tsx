import React from "react";

import "./header1.scss";

interface Header extends React.HTMLAttributes<HTMLElement> {}

export function Header(props: Header) {
  return <header className="header1">{props.children}</header>;
}
