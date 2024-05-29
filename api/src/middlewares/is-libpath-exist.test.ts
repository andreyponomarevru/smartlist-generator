import { Request, Response } from "express";
import { jest, describe, it, expect } from "@jest/globals";
import { isLibPathExist } from ".//is-libpath-exist";
import { isFileExist } from "../utils";

jest.mock("../utils", () => ({ HttpError: class {}, isFileExist: jest.fn() }));

describe("isLibPathExist", () => {
  const res = {} as Response;

  it("calls the next function if libPath is provided in req body and exists", async () => {
    const req = { body: { libPath: "/music/lib" } } as Request;
    const next = jest.fn();
    jest.mocked(isFileExist).mockResolvedValue(true);

    await isLibPathExist(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(next.mock.calls[0].length).toBe(0);
  });

  describe("calls the next function with an error", () => {
    it("if libPath doesn't exist", async () => {
      const req = { body: { libPath: "/music/lib" } } as Request;
      const next = jest.fn();
      jest.mocked(isFileExist).mockResolvedValue(false);

      await isLibPathExist(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toHaveBeenCalledWith({});
    });

    it("if libPath is not provided in request body", async () => {
      const req = { body: {} } as Request;
      const next = jest.fn();
      jest.mocked(isFileExist).mockResolvedValue(false);

      await isLibPathExist(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toHaveBeenCalledWith({});
    });
  });
});
