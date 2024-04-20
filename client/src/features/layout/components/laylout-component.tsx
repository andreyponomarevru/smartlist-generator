import React from "react";
import { Outlet as CurrentPageContent } from "react-router-dom";

import { Player } from "../../player";
import { Sidebar } from "./sidebar/sidebar-component";

import "./layout.scss";

export function Layout() {
  return (
    <>
      <main className="main">
        <Sidebar />
        <CurrentPageContent />
      </main>
      <Player />
    </>
  );
}
