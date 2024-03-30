import { HTTP_PORT } from "./config/env";
import { httpServer } from "./http-server";
import util from "util";
import * as postgresConnection from "./config/postgres";

function onWarning(err: Error) {
  console.warn(err.stack);
}

function onUncaughtException(err: Error) {
  console.error(`uncaughtException: ${err.message} \n${err.stack}`);
  postgresConnection.close();
  process.exit(1);
}

function onUnhandledRejection(reason: string, promise: Promise<Error>) {
  console.error(
    `UnhandledRejection: ${util.inspect(promise)}, reason "${reason}"`,
  );
}

process.once("uncaughtException", onUncaughtException);
process.on("unhandledRejection", onUnhandledRejection);
process.on("warning", onWarning);

httpServer.listen(HTTP_PORT);
