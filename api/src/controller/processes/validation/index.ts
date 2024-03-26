import { ChildProcess, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import { SSE } from "../../../middlewares/sse";
import * as processModel from "../../../model/processes";
import { ProcessMessage } from "../../../types";
import { HttpError } from "../../../utils/error";
import { NODE_PROCESS, PROCESSES } from "../../../config/processes";

export const validationSSE = new SSE({
  status:
    "Test message. The connection for SSE of type 'validation' is established",
});

// We need to keep the process in memory in order to be able to kill it later
let process: ChildProcess | null = null;

async function onMessage(message: ProcessMessage) {
  const processState = await processModel.update(message);
  validationSSE.send(processState, "validation");
  console.log("[message] Done. All files has been validated");
}

async function onError(err: Error) {
  console.log("[error] (child process - validation)", err);
  validationSSE.send({ name: "validation", status: "failure" }, "validation");
  await processModel.update({ name: "validation", status: "failure" });
}

function onClose() {
  process = null;
}

export async function startValidation(
  req: Request<unknown, unknown, { libPath: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (process && process.pid) {
      res.status(400).json({ message: "Files validation is already running" });
    } else {
      await processModel.destroy("validation");
      const processState = await processModel.create({
        name: "validation",
        status: "pending",
      });
      res.status(202).json({ results: processState });
      validationSSE.send(processState);

      process = spawn(
        NODE_PROCESS,
        [PROCESSES.validation.scriptPath, req.body.libPath],
        PROCESSES.validation.processOpts,
      )
        .on("message", onMessage)
        .on("error", onError)
        .on("close", onClose);
    }
  } catch (err) {
    next(err);
  }
}

export async function getValidationStatusAsSSE(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    validationSSE.send(await processModel.read("validation"), "validation");
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
    if (!process || !process.pid) {
      throw new HttpError({
        code: 404,
        message: `Nothing to stop — the validation process is not running`,
      });
    } else {
      process.kill("SIGTERM");

      process = null;
      await processModel.destroy("validation");
      res.status(200).end();
    }
  } catch (err) {
    next(err);
  }
}
