import React from "react";
import { Outlet } from "react-router-dom";

import { Player } from "../player/player";
import { Sidebar } from "./sidebar/sidebar";

import "./layout.scss";

export function Layout() {
  return (
    <>
      <main className="main">
        <Sidebar />
        <Outlet />
      </main>
      <Player />
    </>
  );
}
