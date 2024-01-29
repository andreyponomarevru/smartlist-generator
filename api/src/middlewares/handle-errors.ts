import util from "util";
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { DatabaseError } from "pg";
import { DATABASE_ERROR_CODES } from "../config/constants";
import { HttpError } from "../utils/error";

// Main error handler (this is a centralized error handler — all error handling logic is here)
// - handle errors passed to next() handler
// - handle errors thrown inside route handler
// - ...
export function handleErrors(
  err: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(`Express Main Error Handler\n${util.inspect(err)}`);

  // TODO rewrite with the 'switch' statement

  if (err instanceof DatabaseError && typeof err.code === "string") {
    res
      .status(DATABASE_ERROR_CODES[err.code].httpStatusCode)
      .json(DATABASE_ERROR_CODES[err.code].response);
    return;
  }

  if (err instanceof HttpError) {
    res.status(Number(err.status)).json(err);
    return;
  }

  if (err instanceof Joi.ValidationError) {
    res.status(400).json(
      new HttpError({
        code: 400,
        message: err.details.map((err) => err.message).join("; "),
      }),
    );
    return;
  }

  if (err instanceof Error) {
    console.error(err);
    res.status(500).json(new HttpError({}));
    return;
  }
}
