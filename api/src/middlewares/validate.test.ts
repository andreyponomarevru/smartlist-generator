import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { jest, describe, it, expect } from "@jest/globals";
import { validate } from "./validate";

jest.mock<typeof import("util")>("util");

describe("validate", () => {
  describe("if validation succeeds", () => {
    it("calls the next function if validation succeeds", async () => {
      const reqData = { one: 1, two: "two" };
      const validationSchema = {
        validateAsync: jest
          .fn<() => Promise<object>>()
          .mockResolvedValue(reqData),
      } as unknown as Joi.AnySchema;
      const req = { body: reqData } as Request;
      const res = {} as Response;
      const next = jest.fn<() => NextFunction>();

      await validate(validationSchema, "body")(req, res, next);

      expect(validationSchema.validateAsync).toHaveBeenCalledTimes(1);
      expect(validationSchema.validateAsync).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it("assigns validated props to the request object", async () => {
      const reqData = { one: 1, two: "two" };
      const validationSchema = {
        validateAsync: jest
          .fn<() => Promise<object>>()
          .mockResolvedValue(reqData),
      } as unknown as Joi.AnySchema;
      const req = { body: reqData } as Request;
      const res = {} as Response;
      const next = (() => {}) as NextFunction;

      await validate(validationSchema, "body")(req, res, next);

      expect(req.body).toStrictEqual(req.body);
    });
  });

  it("passes an error to the next function if validation fails", async () => {
    const reqData = { one: 1, two: "two" };
    const err = new Error("my err");
    const validationSchema = {
      validateAsync: jest.fn<() => Promise<Error>>().mockRejectedValue(err),
    } as unknown as Joi.AnySchema;
    const req = { body: reqData } as Request;
    const res = {} as Response;
    const next = jest.fn<() => NextFunction>();

    await validate(validationSchema, "body")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(err);
  });
});
