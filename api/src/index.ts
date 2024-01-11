import express, { Express, Request, Response } from "express";
// import { router as tracksRouter } from "./controller/tracks";
import {
  onUncaughtException,
  onUnhandledRejection,
  onWarning,
} from "./event-handlers/node-process";
import { HTTP_PORT } from "./config/env";
import { httpServer } from "./http-server";

process.once("uncaughtException", onUncaughtException);
process.on("unhandledRejection", onUnhandledRejection);
process.on("warning", onWarning);

httpServer.listen(HTTP_PORT);
