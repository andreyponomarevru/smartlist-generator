import React from "react";
import { FaDatabase } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { RiPlayList2Fill } from "react-icons/ri";
import { IoIosStats } from "react-icons/io";
import { MdAddToPhotos } from "react-icons/md";

import { PATHS } from "../../../config/routes";
import { Logo } from "./logo";

import "./sidebar.scss";

export function Sidebar() {
  const items = [
    { Icon: MdAddToPhotos, name: "Create", to: PATHS.create },
    { Icon: FaFilter, name: "Filters", to: PATHS.filters },
    { Icon: RiPlayList2Fill, name: "Playlist", to: PATHS.playlist },
    { Icon: FaDatabase, name: "Database", to: PATHS.database },
    { Icon: IoIosStats, name: "Stats", to: PATHS.stats },
  ];

  return (
    <nav className="sidebar">
      <span className="sidebar__logo">
        <NavLink to={PATHS.index}>
          <Logo />
        </NavLink>
      </span>
      <nav className="sidebar__menu">
        {items.map(({ Icon, name, to }) => (
          <NavLink
            key={name}
            to={to}
            className={({ isActive }) => {
              return isActive
                ? "sidebar__list-item sidebar__list-item_active"
                : "sidebar__list-item";
            }}
          >
            <span className="sidebar__icon-wrapper">
              <Icon />
            </span>
            <span className="sidebar__item-name">{name}</span>
          </NavLink>
        ))}
      </nav>
    </nav>
  );
}
