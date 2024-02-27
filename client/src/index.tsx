import * as React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app/app";

// Global styles
import "./reset.scss";
import "./layout.scss";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
