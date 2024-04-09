import React from "react";
import { FaDatabase } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { RiPlayList2Fill } from "react-icons/ri";
import { IoIosStats } from "react-icons/io";

import { PATHS } from "../../../config/routes";
import { Logo } from "./logo-component";

import "./sidebar.scss";

export function Sidebar() {
  const itemsJSX = [
    { Icon: FaFilter, name: "Filters", to: PATHS.filters },
    { Icon: RiPlayList2Fill, name: "Playlist", to: PATHS.playlist },
    { Icon: FaDatabase, name: "Settings", to: PATHS.settings },
    { Icon: IoIosStats, name: "Stats", to: PATHS.stats },
  ].map(({ Icon, name, to }) => (
    <NavLink
      key={name}
      to={to}
      className={({ isActive }) => {
        return isActive
          ? "sidebar__list-item sidebar__list-item_active"
          : "sidebar__list-item";
      }}
    >
      {({ isActive, isPending }) => {
        return isPending ? (
          "Loading...."
        ) : (
          <>
            <span className="sidebar__icon-wrapper">
              <Icon style={{ fill: isActive ? "white" : "black" }} />
            </span>
            <span className="sidebar__item-name">{name}</span>
          </>
        );
      }}
    </NavLink>
  ));

  return (
    <nav className="sidebar">
      <span className="sidebar__logo">
        <NavLink to={PATHS.index}>
          <Logo />
        </NavLink>
      </span>
      <nav className="sidebar__menu">{itemsJSX}</nav>
    </nav>
  );
}
