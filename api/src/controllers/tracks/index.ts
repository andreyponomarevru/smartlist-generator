import { Request, Response, NextFunction } from "express";

import * as trackModel from "../../models/track";
import { SearchParams } from "../../utils/query-builder";
import { FoundTrack } from "../../types";

export async function findTrack(
  req: Request<unknown, unknown, SearchParams>,
  res: Response<{ results: FoundTrack[] }>,
  next: NextFunction,
) {
  try {
    const searchParams = req.body;
    res.json({ results: await trackModel.queries.find(searchParams) });
  } catch (err) {
    next(err);
  }
}

export async function getTrackIdsByFilePaths(
  req: Request<unknown, unknown, { filePaths: string[] }>,
  res: Response<{ results: { trackId: number; filePath: string }[] }>,
  next: NextFunction,
) {
  try {
    const { filePaths } = req.body;
    res.json({
      results: await trackModel.queries.findIdsByFilePaths(filePaths),
    });
  } catch (err) {
    next(err);
  }
}
