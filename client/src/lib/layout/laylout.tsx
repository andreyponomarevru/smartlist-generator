import React from "react";
import { Outlet } from "react-router-dom";

import { Header } from "./header/header";
import { Footer } from "./footer/footer";
import { Player } from "../player/player";

import "./layout.scss";

export function Layout() {
  return (
    <>
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Player />
      <Footer />
    </>
  );
}
