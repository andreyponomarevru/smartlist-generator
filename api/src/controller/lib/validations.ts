import { ChildProcess, SpawnOptions, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import * as validationModel from "../../model/validation/index";

// We need to keep the job in memory in order to be able to kill it later
let job: ChildProcess | null = null;
const VALIDATION_JOB_OPTS: SpawnOptions = {
  detached: false,
  stdio: ["inherit", "inherit", "inherit", "ipc"],
};

export async function runValidation(
  req: Request<any, any, { libPath: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (job && job.pid) {
      res.status(500).json({ message: "Validation is already running" });
      return;
    } else {
      const { libPath } = req.body;

      const newValidation = await validationModel.create();
      res.json(newValidation);

      job = spawn(
        "node",
        ["../../jobs/validate.js", libPath],
        VALIDATION_JOB_OPTS,
      )
        .on("message", async (message) => {
          console.log("*** MESSAGE", message);
          await validationModel.update(
            newValidation.validationId,
            JSON.parse(message.toString()),
          );
        })
        .on("close", async () => (job = null));
      res.status(202);
      return;
    }
  } catch (err) {
    next(err);
  }
}

export async function getValidation(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("+++");
    res.json(await validationModel.read(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function cancelValidation(
  req: Request<any, any, any, { id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!job || !job.pid) {
      res.status(404);
      return;
    }

    job.kill("SIGTERM");
    job = null;
    await validationModel.destroy(req.params.id);
    res.status(200);
  } catch (err) {
    next(err);
  }
}
