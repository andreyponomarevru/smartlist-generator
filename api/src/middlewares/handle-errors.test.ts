import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { handleErrors } from "./handle-errors";
import { HttpError } from "../utils";

jest.mock("../utils", () => ({
  HttpError: class {
    status: number;

    constructor() {
      this.status = 0;
    }
  },
}));
jest.mock("joi", () => ({
  ValidationError: class {
    details: { message: string }[];

    constructor() {
      this.details = [{ message: "joi" }];
    }
  },
}));

describe("handleErrors", () => {
  const req = {} as Request;

  it("stops executing function if HTTP headers have already been sent", async () => {
    const res = { headersSent: true } as Response;
    res.json = jest.fn() as any;
    res.status = jest.fn(() => res);
    const next = jest.fn();
    const err = new Error();

    handleErrors(err, req, res, next);

    expect(res.json).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(0);
  });

  describe("returns an error response", () => {
    it("if it is a validation error", async () => {
      const res = { headersSent: false } as Response;
      res.json = jest.fn() as any;
      res.status = jest.fn(() => res);
      const next = function () {} as NextFunction;
      const joiErr = new Joi.ValidationError(
        "joi error",
        [{ message: "err", path: ["err"], type: "err" }],
        new Error("err"),
      );

      handleErrors(joiErr, req, res, next);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ status: 0 });
    });

    it("if it is an instance of HTTP error", () => {
      const res = { headersSent: false } as Response;
      res.json = jest.fn() as any;
      res.status = jest.fn(() => res);
      const next = function () {} as NextFunction;
      const httpErr = new HttpError({} as any);

      handleErrors(httpErr, req, res, next);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(0);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ status: 0 });
    });

    it("if it is any other type of error", async () => {
      const res = { headersSent: false } as Response;
      res.json = jest.fn() as any;
      res.status = jest.fn(() => res);
      const next = function () {} as NextFunction;
      const err = new Error();

      handleErrors(err, req, res, next);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ status: 0 });
    });
  });
});
