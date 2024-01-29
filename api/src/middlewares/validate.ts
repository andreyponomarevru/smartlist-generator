import util from "util";
import { RequestHandler } from "express";
import Joi from "joi";

export function validate(
  schema: Joi.AnySchema,
  location: "body" | "headers" | "query" | "params",
): RequestHandler {
  return async function (req, res, next): Promise<void> {
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
  };
}
