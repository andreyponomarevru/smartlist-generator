import { ChildProcess, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import * as taskModel from "../../../model/task";
import { ProcessMessage } from "../../../types";
import { HttpError } from "../../../utils/error";
import {
  NODE_PROCESS,
  PROCESS_OPTS,
  SCRIPT_EXTENSION,
} from "../../../config/tasks";

// We need to keep the job in memory in order to be able to kill it later
let job: ChildProcess | null = null;
const SCRIPT_PATH = `./src/jobs/validate.${SCRIPT_EXTENSION}`;

async function onMessage(message: ProcessMessage) {
  await taskModel.update(message);
  console.log("[message] Done. All files has been validated");
}

async function onError(err: Error) {
  console.log("[error] (child process - validation)", err);
  await taskModel.update({ name: "validation", status: "failure" });
}

function onClose() {
  job = null;
}

export async function startValidation(
  req: Request<unknown, unknown, { libPath: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (job && job.pid) {
      res.status(400).json({ message: "Files validation is already running" });
    } else {
      await taskModel.destroy("validation");
      res
        .status(202)
        .json(
          await taskModel.create({ name: "validation", status: "pending" }),
        );

      job = spawn(NODE_PROCESS, [SCRIPT_PATH, req.body.libPath], PROCESS_OPTS)
        .on("message", onMessage)
        .on("error", onError)
        .on("close", onClose);
    }
  } catch (err) {
    next(err);
  }
}

export async function getValidation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await taskModel.read("validation"));
  } catch (err) {
    next(err);
  }
}

export async function stopValidation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!job || !job.pid) {
      throw new HttpError({
        code: 404,
        message: `Nothing to stop — the validation process is not running`,
      });
    } else {
      job.kill("SIGTERM");

      job = null;
      await taskModel.destroy("validation");
      res.status(200).end();
    }
  } catch (err) {
    next(err);
  }
}
