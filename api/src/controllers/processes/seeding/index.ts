import { ChildProcess, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import { NODE_PROCESS, PROCESSES } from "../../../config/processes";
import * as processModel from "../../../models/processes";
import * as trackModel from "../../../models/track";
import { ProcessMessage } from "../../../types";
import { SSE } from "../../../middlewares/sse";

export const seedingSSE = new SSE({
  status:
    "Test message. The connection for SSE of type 'seeding' is established",
});

// We need to keep the process in memory in order to be able to kill it later
let process: ChildProcess | null = null;

export async function startSeeding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  async function onMessage(message: ProcessMessage) {
    console.log("[message] Done. Database has been seeded");
    seedingSSE.send(await processModel.queries.update(message), "seeding");
  }

  async function onError(err: Error) {
    console.log("[error] (child process - seeding)", err);
    seedingSSE.send({ name: "seeding", status: "failure" }, "seeding");
    await processModel.queries.destroy("seeding");
  }

  function onJobClose() {
    process = null;
  }

  try {
    if (process && process.pid) {
      res
        .status(400)
        .json({ code: 400, message: "Db seeding is already running ..." });
    } else {
      await processModel.queries.destroy("seeding");
      const processState = await processModel.queries.create({
        name: "seeding",
        status: "pending",
      });
      res.status(202).json({ results: processState });
      seedingSSE.send(processState, "seeding");

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
    seedingSSE.send(await processModel.queries.read("seeding"), "seeding");
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
    if (process && process.pid) {
      process.kill("SIGTERM");
      process = null;
    }

    await processModel.queries.destroy("seeding");
    await trackModel.queries.destroyAll();
    seedingSSE.send(null, "seeding");
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
