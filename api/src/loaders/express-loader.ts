import path from "path";
import cors from "cors";

import express from "express";

import { HTTP_PORT } from "../config/env";
import * as env from "../config/env";
import { handle404Error } from "../middlewares/handle-404-error";
import { handleErrors } from "../middlewares/handle-errors";
import { apiRouter } from "../controllers/router";
import { API_PREFIX } from "../config/constants";

export function expressLoader() {
  const app = express();

  app.set("port", HTTP_PORT);
  // If the Node app is behind a proxy (like Nginx), we have to set
  // proxy to true (more precisely to 'trust first proxy')
  if (env.NODE_ENV === "production") app.set("trust proxy", 1);
  app.use(cors());
  app.use((req, res, next) => {
    console.log(req.headers);
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(API_PREFIX, apiRouter);

  // If request doesn't match the routes above, it is past to 404 error handler
  app.use(handle404Error);
  app.use(handleErrors);

  return app;
}
