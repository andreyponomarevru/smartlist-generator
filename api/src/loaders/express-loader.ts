import path from "path";
import cors from "cors";

import { type expressConfig } from "../config/express";

export function expressLoader(
  express: typeof import("express"),
  config: typeof expressConfig,
) {
  const app = express();

  app.set("port", config.httpPort);
  // If the Node app is behind a proxy (like Nginx), we have to set
  // proxy to true (more precisely to 'trust first proxy')
  if (config.env === "production") app.set("trust proxy", 1);
  app.use(cors());
  app.use((req, res, next) => {
    console.log(req.headers);
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(config.apiPrefix, config.router);

  // If request doesn't match the routes above, it is past to 404 error handler
  app.use(config.appServerHandlers.handle404Error);
  app.use(config.appServerHandlers.handleErrors);

  return app;
}
