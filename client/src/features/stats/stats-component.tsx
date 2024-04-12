import React from "react";
import { FaSortAlphaDown } from "react-icons/fa";
import { FaSortAmountDown } from "react-icons/fa";
import { FaSortAlphaDownAlt } from "react-icons/fa";
import { FaSortAmountDownAlt } from "react-icons/fa";

import { Stats } from "../../types";

import "./stats.scss";

type StatsItem = { name: string; count: number };

interface StatsProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  stats: StatsItem[];
}

export function Stats(props: StatsProps) {
  const [sortType, setSortType] = React.useState<"alpha" | "num">("alpha");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  function sortBy(a: StatsItem, b: StatsItem) {
    if (sortType === "alpha") {
      return sortDir === "asc"
        ? a.name.toString().localeCompare(b.name.toString())
        : b.name.toString().localeCompare(a.name.toString());
    } else {
      return sortDir === "asc" ? a.count - b.count : b.count - a.count;
    }
  }

  const statsList = [...props.stats].sort(sortBy).map((item) => {
    return (
      <li key={item.name} className="stats__list-item">
        <span className="stats__list-item-text">
          <span>{item.name}</span>
          <span>{item.count}</span>
        </span>
        <span className="stats__graph">
          <span
            className="stats__graph-bar"
            style={{ width: item.count / 4 }}
          ></span>
        </span>
      </li>
    );
  });

  return (
    <section>
      <h2 className="stats__header">
        {props.name} ({props.stats.length})
        <span className="stats__icons">
          <button
            type="button"
            className="btn btn_hover_grey-20 btn_type_icon"
            onClick={() => {
              setSortDir("desc");
              setSortType("num");
            }}
          >
            <FaSortAmountDown className="icon" />
          </button>
          <button
            type="button"
            className="btn btn_hover_grey-20 btn_type_icon"
            onClick={() => {
              setSortDir("asc");
              setSortType("num");
            }}
          >
            <FaSortAmountDownAlt className="icon" />
          </button>
          <button
            type="button"
            className="btn btn_hover_grey-20 btn_type_icon"
            onClick={() => {
              setSortDir("desc");
              setSortType("alpha");
            }}
          >
            <FaSortAlphaDownAlt className="icon" />
          </button>
          <button
            type="button"
            className="btn btn_hover_grey-20 btn_type_icon"
            onClick={() => {
              setSortDir("asc");
              setSortType("alpha");
            }}
          >
            <FaSortAlphaDown className="icon" />
          </button>
        </span>
      </h2>
      <ul className="stats__list">{statsList}</ul>
    </section>
  );
}
