import express, { Request, Response, NextFunction } from "express";
import * as trackModel from "../model/track/index";
import { streamChunked } from "../utils/stream-audio";
import { validate } from "../middlewares/validate";
import {
  schemaIdParam,
  schemaFindTrackReqBody,
  schemaFindTrackIdsByFilePathsReqBody,
} from "../config/validation-schemas";
import { HttpError } from "../utils/error";
import { SearchParams } from "../utils/query-builder";

const router = express.Router();

async function stream(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const trackFilePath = await trackModel.readFilePath(req.params.id);
    if (!trackFilePath) throw new HttpError({ code: 404 });
    await streamChunked(req, res, trackFilePath);
  } catch (err) {
    next(err);
  }
}

async function getTrack(
  req: Request<any, any, SearchParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const searchParams = req.body;
    res.json({ results: await trackModel.findTrack(searchParams) });
  } catch (err) {
    next(err);
  }
}

async function getTrackIdsByFilePaths(
  req: Request<any, any, { filePaths: string[] }>,
  res: Response<{ results: { trackId: number; filePath: string }[] }>,
  next: NextFunction,
) {
  try {
    const { filePaths } = req.body;
    res.json({ results: await trackModel.findTrackIdsByFilePaths(filePaths) });
  } catch (err) {
    next(err);
  }
}

router.get(
  "/api/tracks/:id/stream",
  validate(schemaIdParam, "params"),
  stream as any,
);
router.post("/api/tracks", validate(schemaFindTrackReqBody, "body"), getTrack);
router.post(
  "/api/tracks/searches",
  validate(schemaFindTrackIdsByFilePathsReqBody, "body"),
  getTrackIdsByFilePaths,
);

export { router };
