import React from "react";
import { FaDatabase } from "react-icons/fa";

import { Stats } from "../stats/stats";
import { Stats as StatsType } from "../../types";

import "./sidebar.scss";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: {
    years?: StatsType[];
    genres?: StatsType[];
  };
}

export function Sidebar(props: SidebarProps) {
  return (
    <div className={`sidebar ${props.className || ""}`}>
      <ul className="sidebar__general-stats">
        <li className="sidebar__row">
          <span className="sidebar__stats sidebar__stats_name">
            <FaDatabase className="icon" />
            <span>init. on {new Date().toDateString()}</span>
          </span>
        </li>
        <li className="sidebar__row">
          <span className="sidebar__stats sidebar__stats_name">
            Total tracks
          </span>
          <span className="sidebar__stats sidebar__stats_value">
            {props.stats.years?.reduce(
              (accumulator, currentValue) => accumulator + currentValue.count,
              0
            )}
          </span>
        </li>
      </ul>

      <Stats title="Genres" stats={props.stats.genres} />
      <Stats title="Years" stats={props.stats.years} />

      <div className="btn btn_theme_transparent-black sidebar__btn">
        Reset db
      </div>
    </div>
  );
}
