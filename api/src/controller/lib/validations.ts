import { ChildProcess, SpawnOptions, spawn } from "child_process";

import { Request, Response, NextFunction } from "express";

import { NODE_ENV } from "../../config/env";
import * as validationModel from "../../model/validation/index";
import { ValidationResult } from "../../types";
import { HttpError } from "../../utils/error";

// We need to keep the job in memory in order to be able to kill it later
let job: ChildProcess | null = null;
const VALIDATION_OPTS: SpawnOptions = {
  detached: false,
  stdio: ["inherit", "inherit", "inherit", "ipc"],
};
const VALIDATION_SCRIPT_PATH = `./src/jobs/validate.${NODE_ENV === "development" ? "ts" : "js"}`;
const NODE_PROCESS = NODE_ENV === "development" ? "ts-node" : "node";

export async function runValidation(
  req: Request<unknown, unknown, { libPath: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (job && job.pid) {
      res.status(500).json({ message: "Validation is already running" });
      return;
    } else {
      const newValidation = await validationModel.create(
        "pending",
        req.body.libPath,
      );
      res.status(202).json(newValidation);

      job = spawn(
        NODE_PROCESS,
        [VALIDATION_SCRIPT_PATH, req.body.libPath],
        VALIDATION_OPTS,
      )
        .on("message", async (message: ValidationResult) => {
          await validationModel.update(newValidation.validationId, message);
        })
        .on("close", () => (job = null))
        .on("error", async (err) => {
          console.log("[error in child process (validation job)]", err);
          await validationModel.destroy(newValidation.validationId);
        });
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
    res.json(await validationModel.read(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function cancelValidation(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log(job);
    if (!job || !job.pid) {
      throw new HttpError({
        code: 404,
        message: `There is no running validation job with ID ${req.params.id}`,
      });
    } else {
      job.kill("SIGTERM");

      job = null;
      await validationModel.destroy(req.params.id);
      res.status(200).end();
    }
  } catch (err) {
    next(err);
  }
}
