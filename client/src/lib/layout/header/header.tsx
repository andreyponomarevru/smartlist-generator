import React from "react";
import { Link } from "react-router-dom";

import { PATHS } from "../../../config/routes";

import "./header.scss";

export function Header() {
  return (
    <header className="header">
      <span className="header__logo">
        <Link to={PATHS.index}>Smartlist Generator</Link>
      </span>
      <ul className="header__menu">
        <li>
          <Link to={PATHS.lib}>Library</Link>
        </li>
        <li>
          <Link to={PATHS.playlistBuilder}>Playlist Builder</Link>
        </li>
        <li>
          <Link to={PATHS.filters}>Filters</Link>
        </li>
      </ul>
    </header>
  );
}
