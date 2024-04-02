import util from "util";

import Joi from "joi";
import { Request, Response, NextFunction } from "express";

import { HttpError } from "../utils";

// Main error handler (this is a centralized error handler — all error handling logic is here)
// - handle errors passed to next() handler
// - handle errors thrown inside route handler
// - ...
export function handleErrors(
  err: Error | HttpError,
  req: Request,
  res: Response,
  // DO NOT REMOVE THE UNUSED 'next' PARAMETER, OTHERWISE EXPRESS WON'T TRIGGER
  // THIS ERROR HANDLER
  next: NextFunction,
) {
  console.error(`Express Main Error Handler\n${util.inspect(err)}`);

  if (res.headersSent) return;

  if (err instanceof Joi.ValidationError) {
    res.status(400).json(
      new HttpError({
        code: 400,
        message: err.details.map((err) => err.message).join("; "),
      }),
    );
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json(err);
    return;
  }

  res.status(500).json(
    new HttpError({
      code: 500,
      message: "Something bad happened on the server side :(",
    }),
  );
  return;
}
