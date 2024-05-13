import util from "util";

import { RequestHandler, Request, Response, NextFunction } from "express";

import Joi from "joi";

type Location = "body" | "headers" | "query" | "params";

export function validate<T>(
  schema: Joi.AnySchema<T>,
  location: Location,
): RequestHandler<any, unknown, unknown, any> {
  async function reqHandler(req: Request, res: Response, next: NextFunction) {
    console.log(
      `${__filename}: [before validation] ${util.inspect(req[location])}`,
    );

    try {
      const validated = await schema.validateAsync(req[location]);
      req[location] = { ...req[location], ...validated };

      console.log(
        `${__filename}: [after validation] ${util.inspect(req[location])}`,
      );
    } catch (err) {
      next(err);
    }

    next();
  }

  return reqHandler;
}
