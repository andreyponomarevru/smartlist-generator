import util from "util";
import * as postgresConnection from "../config/postgres";

export function onWarning(err: Error) {
  console.warn(err.stack);
}

export function onUncaughtException(err: Error) {
  console.error(`uncaughtException: ${err.message} \n${err.stack}`);
  postgresConnection.close();
  process.exit(1);
}

export function onUnhandledRejection(reason: string, promise: Promise<Error>) {
  console.error(
    `UnhandledRejection: ${util.inspect(promise)}, reason "${reason}"`,
  );
}
