import { describe, expect, it, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import {
  getTrackFilePath,
  GetTrackFilePathReqParams,
} from "./get-track-file-path";
import { trackService } from "../services";

jest.mock("../services", () => ({
  trackService: { findFilePathById: jest.fn() },
}));
jest.mock("../utils", () => ({
  HttpError: class {},
}));

describe("getTrackFilePath", () => {
  const req = { params: { id: 1 } } as Request<GetTrackFilePathReqParams>;

  describe("if track id exists", () => {
    it("saves track file path to res.locals", async () => {
      const res = { locals: {} } as Response;
      const next = function () {} as NextFunction;
      const filePath = "/path/to/file.flac";
      jest.mocked(trackService).findFilePathById.mockResolvedValue(filePath);

      await getTrackFilePath(req, res, next);

      expect(res.locals.trackFilePath).toEqual(filePath);
    });

    it("calls the next function with no arguments", async () => {
      const res = { locals: {} } as Response;
      const next = jest.fn();
      jest
        .mocked(trackService)
        .findFilePathById.mockResolvedValue("/path/to/file.flac");

      await getTrackFilePath(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0].length).toBe(0);
    });
  });

  it("calls the next function with an error, if track id doesn't exist", async () => {
    const res = { locals: {} } as Response;
    const next = jest.fn();
    jest.mocked(trackService).findFilePathById.mockResolvedValue(null);

    await getTrackFilePath(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({}));
  });
});
