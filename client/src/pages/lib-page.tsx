import React from "react";

import { Sidebar } from "../lib/sidebar/sidebar";

export function LibPage() {
  return (
    <div>
      Library page
      <section>Controls</section>
      <section>
        <h1>Statistics</h1>
        <main>
          <Sidebar className="app__sidebar" />
        </main>
      </section>
    </div>
  );
}
