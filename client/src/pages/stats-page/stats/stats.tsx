import React from "react";
import { FaSortAlphaDown } from "react-icons/fa";
import { FaSortAmountDown } from "react-icons/fa";
import { FaSortAlphaDownAlt } from "react-icons/fa";
import { FaSortAmountDownAlt } from "react-icons/fa";

import { Stats } from "../../../types";

import "./stats.scss";

interface StatsProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  stats: Stats[];
}

export function Stats(props: StatsProps) {
  const [sortedByNum, setSortByNum] = React.useState(false);
  const [sortedByAlpha, setSortByAlpha] = React.useState(true);

  const [stats, setStats] = React.useState(props.stats);

  React.useEffect(() => {
    sortedByNum
      ? setStats([...stats].sort((a, b) => a.count - b.count))
      : setStats([...stats].sort((a, b) => b.count - a.count));
  }, [sortedByNum]);

  React.useEffect(() => {
    sortedByAlpha
      ? setStats([
          ...stats.sort((a, b) =>
            a.name.toString().localeCompare(b.name.toString()),
          ),
        ])
      : setStats([
          ...stats.sort((a, b) =>
            b.name.toString().localeCompare(a.name.toString()),
          ),
        ]);
  }, [sortedByAlpha]);

  return (
    <section>
      <h2 className="stats__header">
        {props.name} ({stats.length})
        <span className="stats__icons">
          <button
            type="button"
            className="btn btn_hover_grey-20 btn_type_icon"
            onClick={() => setSortByAlpha((prev) => !prev)}
          >
            {sortedByAlpha ? (
              <FaSortAlphaDown className="icon" />
            ) : (
              <FaSortAlphaDownAlt className="icon" />
            )}
          </button>
          <button
            type="button"
            className="btn btn_hover_grey-20 btn_type_icon"
            onClick={() => setSortByNum((prev) => !prev)}
          >
            {sortedByNum ? (
              <FaSortAmountDownAlt className="icon" />
            ) : (
              <FaSortAmountDown className="icon" />
            )}
          </button>
        </span>
      </h2>
      <ul className="stats__list">
        {stats.map((year) => {
          return (
            <li key={year.name} className="stats__list-item">
              <span className="stats__list-item-text">
                <span>{year.name}</span>
                <span>{year.count}</span>
              </span>
              <span className="stats__graph">
                <span
                  className="stats__graph-bar"
                  style={{ width: year.count / 4 }}
                ></span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
