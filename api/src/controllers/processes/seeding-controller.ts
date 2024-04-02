import { ChildProcess, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import { NODE_PROCESS, PROCESSES } from "../../config/processes";
import { ProcessMessage, Process } from "../../types";
import { HttpError } from "../../utils";
import { wrapResponse } from "../../utils";
import { processService, trackService } from "../../services";
import { SSE } from "../../middlewares/sse";

export type StartSeedingReqBody = { libPath: string };

export const seedingSSE = new SSE({
  status:
    "Test message. The connection for SSE of type 'seeding' is established",
});

// We need to keep the process in memory in order to be able to kill it later
let seedingProcess: ChildProcess | null = null;

export const seedingController = {
  startSeeding: async function (
    req: Request<unknown, unknown, StartSeedingReqBody>,
    res: Response<{ results: Process } | HttpError>,
    next: NextFunction,
  ) {
    async function onMessage(message: ProcessMessage) {
      console.log("[message] Done. Database has been seeded");
      seedingSSE.send(await processService.update(message), "seeding");
    }

    async function onError(err: Error) {
      console.log("[error] (child process - seeding)", err);
      seedingSSE.send({ name: "seeding", status: "failure" }, "seeding");
      await processService.destroy("seeding");
    }

    function onJobClose() {
      seedingProcess = null;
    }

    try {
      if (seedingProcess && seedingProcess.pid) {
        res.status(400).json(
          new HttpError({
            code: 400,
            message: "Db seeding is already running ...",
          }),
        );
      } else {
        await processService.destroy("seeding");
        const processState = await processService.create({
          name: "seeding",
          status: "pending",
        });
        res.status(202).json(wrapResponse(processState));
        seedingSSE.send(processState, "seeding");

        seedingProcess = spawn(
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
  },

  getSeedingStatusAsSSE: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      seedingSSE.send(await processService.read("seeding"), "seeding");
    } catch (err) {
      next(err);
    }
  },

  stopSeeding: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (seedingProcess && seedingProcess.pid) {
        seedingProcess.kill("SIGTERM");
        seedingProcess = null;
      }

      await processService.destroy("seeding");
      await trackService.destroyAll();
      seedingSSE.send(null, "seeding");
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
