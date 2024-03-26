import { SpawnOptions } from "child_process";

import { NODE_ENV } from "./env";

const SCRIPT_EXTENSION = NODE_ENV === "development" ? "ts" : "js";

type Processes = {
  [key: string]: { scriptPath: string; processOpts: SpawnOptions };
};

export const NODE_PROCESS = NODE_ENV === "development" ? "ts-node" : "node";

export const PROCESSES: Processes = {
  validation: {
    scriptPath: `./src/processes/validate.${SCRIPT_EXTENSION}`,
    processOpts: {
      detached: false,
      stdio: ["inherit", "inherit", "inherit", "ipc"],
    },
  },
  seeding: {
    scriptPath: `./src/processes/seed.${SCRIPT_EXTENSION}`,
    processOpts: {
      detached: false,
      stdio: ["inherit", "inherit", "inherit", "ipc"],
    },
  },
};
