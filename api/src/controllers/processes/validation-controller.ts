import { ChildProcess, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import { ProcessMessage, Process } from "../../types";
import { HttpError } from "../../utils";
import { NODE_PROCESS, PROCESSES } from "../../config/processes";
import { wrapResponse } from "../../utils";
import { processService } from "../../services";
import { SSE } from "../../middlewares/sse";

export type StartValidationReqBody = { libPath: string };

export const validationSSE = new SSE({
  status:
    "Test message. The connection for SSE of type 'validation' is established",
});

// We need to keep the process in memory in order to be able to kill it later
let validationProcess: ChildProcess | null = null;

export const validationController = {
  startValidation: async function (
    req: Request<unknown, unknown, { libPath: string }>,
    res: Response<{ results: Process } | HttpError>,
    next: NextFunction,
  ) {
    async function onMessage(message: ProcessMessage) {
      console.log("[message] Done. All files has been validated");
      validationSSE.send(await processService.update(message), "validation");
    }

    async function onError(err: Error) {
      console.log("[error] Error in child process 'validation'", err);
      validationSSE.send(
        await processService.update({ name: "validation", status: "failure" }),
        "validation",
      );
    }

    function onClose() {
      validationProcess = null;
    }

    try {
      if (validationProcess && validationProcess.pid) {
        res.status(400).json(
          new HttpError({
            code: 400,
            message: "Files validation is already running",
          }),
        );
      } else {
        await processService.destroy("validation");
        const processState = await processService.create({
          name: "validation",
          status: "pending",
        });
        res.status(202).json(wrapResponse(processState));
        validationSSE.send(processState, "validation");

        validationProcess = spawn(
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
  },

  getValidationStatusAsSSE: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      validationSSE.send(await processService.read("validation"), "validation");
    } catch (err) {
      next(err);
    }
  },

  stopValidation: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (validationProcess && validationProcess.pid) {
        validationProcess.kill("SIGTERM");
        validationProcess = null;
      }

      await processService.destroy("validation");
      validationSSE.send(null, "validation");
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
