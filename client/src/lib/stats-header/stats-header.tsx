import React from "react";

import "./stats-header.scss";

interface Props {
  title: string;
  count: number;
}

export function StatsHeader(props: Props) {
  return (
    <header className="stats-header">
      <span className="stats-header__title">{props.title}</span>
      <span className="stats-header__count">{props.count}</span>
    </header>
  );
}
