import { ChildProcess, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import { NODE_PROCESS, PROCESSES } from "../../../config/processes";
import * as processModel from "../../../model/processes";
import * as trackModel from "../../../model/track";
import { ProcessMessage } from "../../../types";
import { HttpError } from "../../../utils/error";
import { SSE } from "../../../middlewares/sse";

export const seedingSSE = new SSE({
  status:
    "Test message. The connection for SSE of type 'seeding' is established",
});

// We need to keep the process in memory in order to be able to kill it later
let process: ChildProcess | null = null;

async function onMessage(message: ProcessMessage) {
  const processState = await processModel.update(message);
  seedingSSE.send(processState, "seeding");
  console.log("[message] Done. Database has been seeded");
}

async function onError(err: Error) {
  console.log("[error] (child process - seeding)", err);
  seedingSSE.send({ name: "seeding", status: "failure" }, "seeding");
  await processModel.destroy("seeding");
}

function onJobClose() {
  process = null;
}

export async function startSeeding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Starting db seeding ...");

    if (process && process.pid) {
      res.status(500).json({ message: "Db seeding is already running ..." });
    } else {
      await processModel.destroy("seeding");
      const processState = await processModel.create({
        name: "seeding",
        status: "pending",
      });
      res.status(202).json({ results: processState });
      seedingSSE.send(processState);

      process = spawn(
        NODE_PROCESS,
        [PROCESSES.seeding.scriptPath, req.body.libPath],
        PROCESSES.seeding.processOpts,
      )
        .on("message", onMessage)
        .on("error", onError)
        .on("close", onJobClose);
    }
  } catch (err) {
    next(err);
  }
}

export async function getSeedingStatusAsSSE(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    seedingSSE.send(await processModel.read("seeding"), "seeding");
  } catch (err) {
    next(err);
  }
}

export async function stopSeeding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!process || !process.pid) {
      throw new HttpError({
        code: 404,
        message: `Nothing to stop — the seeding process is not running`,
      });
    } else {
      process.kill("SIGTERM");

      process = null;
      await processModel.destroy("seeding");
      await trackModel.destroyAll();
      res.status(200).end();
    }
  } catch (err) {
    next(err);
  }
}
