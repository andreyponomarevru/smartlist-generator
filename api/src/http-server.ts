import http from "http";
import path from "path";
import express from "express";
import cors from "cors";
import { onServerError, onServerListening } from "./event-handlers/http-server";
import { HTTP_PORT } from "./config/env";
import * as env from "./config/env";
import { handle404Error } from "./controller/middlewares/handle-404-error";
import { handleErrors } from "./controller/middlewares/handle-errors";
import { router as tracksRouter } from "./controller/tracks";
import { router as genresRouter } from "./controller/genres";
import { router as artistsRouter } from "./controller/artists";
import { router as yearsRouter } from "./controller/years";
import { router as libRouter } from "./controller/lib";
import { router as libValidationRouter } from "./controller/lib-validation";
import { router as playlistRouter } from "./controller/playlists";
import { router as statsRouter } from "./controller/stats";

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
expressApp.use("/lib", libRouter);
expressApp.use("/lib/validation", libValidationRouter);
expressApp.use("/lib/stats/genres", statsRouter);
expressApp.use("/lib/years", yearsRouter);
expressApp.use("/playlists", playlistRouter);
//expressApp.use("/lib/artists", artistsRouter);
//expressApp.use("/lib/genres", genresRouter);
//expressApp.use("/lib/tracks", tracksRouter);
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
