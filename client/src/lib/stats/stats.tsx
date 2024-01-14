import * as React from "react";

import "./stats.scss";

interface Props {
  stats: { id: number; name: string | number; count: number }[];
  className?: string;
}

export function Stats(props: Props) {
  return (
    <ul className="stats">
      {...props.stats.map((entry) => {
        return (
          <li
            key={entry.name}
            className={`stats__row ${props.className || ""}`}
          >
            <span>{entry.name}</span>
            <span className="stats__counter">{entry.count}</span>
          </li>
        );
      })}
    </ul>
  );
}
