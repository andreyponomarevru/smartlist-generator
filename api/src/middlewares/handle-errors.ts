import util from "util";

import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { DatabaseError } from "pg";

import { DATABASE_ERROR_CODES } from "../config/constants";
import { CustomDatabaseError, HttpError } from "../utils/error";

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

  // TODO rewrite with the 'switch' statement

  if (err instanceof DatabaseError && typeof err.code === "string") {
    res
      .status(DATABASE_ERROR_CODES[err.code].httpStatusCode)
      .json(DATABASE_ERROR_CODES[err.code].response);
  } else if (err instanceof CustomDatabaseError) {
    if (err.message === "No record with given ID") {
      res.status(404).json(new HttpError({ code: 404, message: err.message }));
    } else {
      // TODO: fix this (HttpError first arg should be code)
      res.status(500).json(new HttpError(err));
    }
  } else if (err instanceof HttpError) {
    res.status(Number(err.status)).json(err);
  } else if (err instanceof Joi.ValidationError) {
    res.status(400).json(
      new HttpError({
        code: 400,
        message: err.details.map((err) => err.message).join("; "),
      }),
    );
  } else if (err instanceof Error) {
    console.error(err);
    res.status(500).json(new HttpError({ code: 500 }));
  }
  return;
}
