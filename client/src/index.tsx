import * as React from "react";
import ReactDOM from "react-dom/client";
import * as Redux from "react-redux";

import { store } from "./app/store";
import { App } from "./app/app";

import "./reset.scss";

async function main() {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
  );

  root.render(
    <React.StrictMode>
      <Redux.Provider store={store}>
        <App />
      </Redux.Provider>
    </React.StrictMode>,
  );
}

main();
