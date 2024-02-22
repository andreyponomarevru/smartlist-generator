import * as React from "react";

import { Stats } from "../../types";

import "./stats.scss";

interface Props extends React.HTMLAttributes<HTMLElement> {
  stats?: Stats[];
}

export function Stats(props: Props) {
  return (
    <section className={`stats ${props.className || ""}`}>
      <header className="stats__header">
        <span>{props.title}</span>
        <span>{props.stats?.length || 0}</span>
      </header>

      <ul className="stats__list">
        {props.stats &&
          props.stats.map((entry) => {
            return (
              <li key={entry.id || entry.name} className="stats__row">
                <span>{entry.name}</span>
                <span>{entry.count}</span>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
