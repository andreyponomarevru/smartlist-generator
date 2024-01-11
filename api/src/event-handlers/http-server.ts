import { HTTP_PORT } from "../config/env";

export function onServerListening() {
  console.log(`${__filename}: HTTP Server is listening on port ${HTTP_PORT}`);
}

export function onServerError(err: NodeJS.ErrnoException) {
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
