import { ChildProcess, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import {
  SCRIPT_EXTENSION,
  NODE_PROCESS,
  PROCESS_OPTS,
} from "../../../config/tasks";
import * as taskModel from "../../../model/task";
import * as trackModel from "../../../model/track";
import { ProcessMessage } from "../../../types";
import { HttpError } from "../../../utils/error";

// We need to keep the job in memory in order to be able to kill it later
let job: ChildProcess | null = null;
const SCRIPT_PATH = `./src/jobs/seed.${SCRIPT_EXTENSION}`;

async function onMessage(message: ProcessMessage) {
  await taskModel.update(message);
  console.log("[message] Done. Database has been seeded");
}

async function onError(err: Error) {
  console.log("[error] (child process - seeding)", err);
  await taskModel.destroy("seeding");
}

function onJobClose() {
  job = null;
}

export async function startSeeding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Starting db seeding ...");

    if (job && job.pid) {
      res.status(500).json({ message: "Db seeding is already running ..." });
    } else {
      await taskModel.destroy("seeding");
      res
        .status(202)
        .json(await taskModel.update({ name: "seeding", status: "pending" }));

      job = spawn(NODE_PROCESS, [SCRIPT_PATH, req.body.libPath], PROCESS_OPTS)
        .on("message", onMessage)
        .on("error", onError)
        .on("close", onJobClose);
    }
  } catch (err) {
    next(err);
  }
}

export async function getSeeding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await taskModel.read("seeding"));
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
    if (!job || !job.pid) {
      throw new HttpError({
        code: 404,
        message: `Nothing to stop — the seeding process is not running`,
      });
    } else {
      job.kill("SIGTERM");

      job = null;
      await taskModel.destroy("seeding");
      await trackModel.destroyAll();
      res.status(200).end();
    }
  } catch (err) {
    next(err);
  }
}
