import React from "react";
import { FaDatabase } from "react-icons/fa";

import { Stats } from "../stats/stats";
import { useGlobalState } from "../../hooks/use-global-state";
import { Loader } from "../loader/loader";
import { Message } from "../message/message";

import "./sidebar.scss";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar(props: SidebarProps) {
  const { statsQuery } = useGlobalState();

  if (statsQuery.isLoading) return <Loader for="page" color="pink" />;

  if (statsQuery.error) {
    return (
      <Message type="danger">
        Something went wrong while loading stats :(
      </Message>
    );
  }

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
            {statsQuery.data?.years.results?.reduce(
              (accumulator, currentValue) => accumulator + currentValue.count,
              0
            )}
          </span>
        </li>
      </ul>

      <Stats title="Genres" stats={statsQuery.data?.genres.results} />
      <Stats title="Years" stats={statsQuery.data?.years.results} />

      <div className="btn btn_theme_transparent-black sidebar__btn">
        Reset db
      </div>
    </div>
  );
}
