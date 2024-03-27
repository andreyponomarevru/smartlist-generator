import { ChildProcess, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import { SSE } from "../../../middlewares/sse";
import * as processModel from "../../../models/processes";
import { ProcessMessage } from "../../../types";
import { HttpError } from "../../../utils/error";
import { NODE_PROCESS, PROCESSES } from "../../../config/processes";

export const validationSSE = new SSE({
  status:
    "Test message. The connection for SSE of type 'validation' is established",
});

// We need to keep the process in memory in order to be able to kill it later
let process: ChildProcess | null = null;

export async function startValidation(
  req: Request<unknown, unknown, { libPath: string }>,
  res: Response,
  next: NextFunction,
) {
  async function onMessage(message: ProcessMessage) {
    console.log("[message] Done. All files has been validated");
    const processState = await processModel.queries.update(message);
    validationSSE.send(processState, "validation");
  }

  async function onError(err: Error) {
    console.log("[error] Error in child process 'validation'", err);
    const processState = await processModel.queries.update({
      name: "validation",
      status: "failure",
    });
    validationSSE.send(processState, "validation");
  }

  function onClose() {
    process = null;
  }

  try {
    if (process && process.pid) {
      res.status(400).json(
        new HttpError({
          code: 400,
          message: "Files validation is already running",
        }),
      );
    } else {
      await processModel.queries.destroy("validation");
      const processState = await processModel.queries.create({
        name: "validation",
        status: "pending",
      });
      res.status(202).json({ results: processState });
      validationSSE.send(processState, "validation");

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
    validationSSE.send(
      await processModel.queries.read("validation"),
      "validation",
    );
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
      await processModel.queries.destroy("validation");
      validationSSE.send(null, "validation");
      res.status(200).end();
    }
  } catch (err) {
    next(err);
  }
}
