import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { jest, describe, it, expect } from "@jest/globals";
import { streamChunked } from "./stream-chunked";

jest.mock("fs", () => ({
  promises: { stat: jest.fn() },
  createReadStream: jest.fn(),
}));

describe("streamChunked", () => {
  it("forwards an error to the next function if res.locals.trackFilePath is not set", async () => {
    const req = {} as Request;
    const res = { locals: {} } as Response;
    const next = jest.fn() as NextFunction;

    await streamChunked(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(
      new Error("res.locals.trackFilePath is required"),
    );
  });

  it("forwards an error to the next function if res.locals.trackFilePath is not a string", async () => {
    const req = {} as Request;
    const res = { locals: { trackFilePath: 1 } } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await streamChunked(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(
      new Error("res.locals.trackFilePath is required"),
    );
  });

  it("forwards an error to the next function if can't read the file", async () => {
    const err = new Error("rejected");
    const filePath = "/path/to/file";
    jest.mocked(fs.promises.stat).mockRejectedValue(err);
    const req = {} as Request;
    const res = {
      locals: { trackFilePath: filePath },
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await streamChunked(req, res, next);

    expect(fs.promises.stat).toHaveBeenCalledTimes(1);
    expect(fs.promises.stat).toHaveBeenCalledWith(filePath);
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(err);
  });

  it("pipes the ReadStream to response object", async () => {
    jest.mocked(fs.promises.stat).mockResolvedValue({ size: 5 } as fs.Stats);
    const pipe = jest.fn();
    jest
      .mocked(fs.createReadStream)
      .mockReturnValue({ pipe } as unknown as fs.ReadStream);
    const req = { headers: { range: "bytes=500-999" } } as Request;
    const res = {
      locals: { trackFilePath: "/path/to/file" },
      writeHead: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await streamChunked(req, res, next);

    expect(pipe).toBeCalledTimes(1);
    expect(pipe).toBeCalledWith(res);
  });
});
