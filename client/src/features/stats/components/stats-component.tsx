import React from "react";
import { FaSortAlphaDown } from "react-icons/fa";
import { FaSortAmountDown } from "react-icons/fa";
import { FaSortAlphaDownAlt } from "react-icons/fa";
import { FaSortAmountDownAlt } from "react-icons/fa";

import { Stats } from "../../../types";

import "./stats.scss";

type StatsItem = { name: string; count: number };

interface Props extends React.HTMLAttributes<HTMLElement> {
  headerName: string;
  stats: StatsItem[];
}

export function Stats(props: Props) {
  const [sortType, setSortType] = React.useState<"alpha" | "num">("alpha");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  function sortBy(a: StatsItem, b: StatsItem) {
    const sort = {
      alpha: {
        asc: a.name.toString().localeCompare(b.name.toString()),
        desc: b.name.toString().localeCompare(a.name.toString()),
      },
      num: { asc: a.count - b.count, desc: b.count - a.count },
    };

    if (sortType && sortDir) return sort[sortType][sortDir];
    else return 0;
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
        {props.headerName} ({props.stats.length})
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
