import * as React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/app";

// Global styles
import "./reset.scss";
import "./layout.scss";

// TODO: replace HashRouter with BrowserRouter (https://reactrouter.com/web/guides/primary-components): keep everything as is, just just the router name in JSX tag. Than on Stackoverflow there is example of Nginx config that BrowserRouter needs to work correctly
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
