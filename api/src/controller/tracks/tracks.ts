import { Request, Response, NextFunction } from "express";

import * as trackModel from "../../model/track/queries";
import { streamChunked } from "../../utils/stream-audio";
import { HttpError } from "../../utils/error";
import { SearchParams } from "../../utils/query-builder";

export async function stream(
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

export async function getTrack(
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

export async function getTrackIdsByFilePaths(
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
