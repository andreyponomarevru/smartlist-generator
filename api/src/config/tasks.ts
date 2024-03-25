import { SpawnOptions } from "child_process";

import { NODE_ENV } from "./env";

export const PROCESS_OPTS: SpawnOptions = {
  detached: false,
  stdio: ["inherit", "inherit", "inherit", "ipc"],
};
export const NODE_PROCESS = NODE_ENV === "development" ? "ts-node" : "node";
export const SCRIPT_EXTENSION = NODE_ENV === "development" ? "ts" : "js";
