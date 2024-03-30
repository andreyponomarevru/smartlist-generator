import http from "http";
import path from "path";
import express from "express";
import cors from "cors";

import { HTTP_PORT } from "./config/env";
import * as env from "./config/env";
import { handle404Error } from "./middlewares/handle-404-error";
import { handleErrors } from "./middlewares/handle-errors";
import { router } from "./controllers/routes";
import { API_PREFIX } from "./config/constants";

function onServerListening() {
  console.log(`${__filename}: HTTP Server is listening on port ${HTTP_PORT}`);
}

function onServerError(err: NodeJS.ErrnoException) {
  if (err.syscall !== "listen") throw err;

  const bind =
    typeof HTTP_PORT === "string" ? `Pipe ${HTTP_PORT}` : `Port ${HTTP_PORT}`;

  // Messages for 'listen' event errors
  switch (err.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw err;
  }
}

//
// Express app
//

const expressApp = express();
expressApp.set("port", HTTP_PORT);
// If the Node app is behind a proxy (like Nginx), we have to set
// proxy to true (more precisely to 'trust first proxy')
if (env.NODE_ENV === "production") expressApp.set("trust proxy", 1);
expressApp.use(cors());
expressApp.use((req, res, next) => {
  console.log(req.headers);
  next();
});
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.static(path.join(__dirname, "public")));
expressApp.use(API_PREFIX, router);
// If request doesn't match the routes above, it is past to 404 error handler
expressApp.use(handle404Error);
expressApp.use(handleErrors);

//
// HTTP server
//

const httpServer = http.createServer(expressApp);
httpServer.on("error", onServerError);
httpServer.on("listening", onServerListening);

export { expressApp, httpServer };
