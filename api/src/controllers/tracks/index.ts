import { Request, Response, NextFunction } from "express";

import * as trackModel from "../../models/track";
import { HttpError } from "../../utils/error";
import { SearchParams } from "../../utils/query-builder";
import { FoundTrack } from "../../types";

export async function getTrackFilePath(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const trackFilePath = await trackModel.queries.findFilePathById(
      req.params.id,
    );
    if (!trackFilePath) throw new HttpError({ code: 404 });
    res.locals.trackFilePath = trackFilePath;
    next();
  } catch (err) {
    next(err);
  }
}

export async function findTrack(
  req: Request<unknown, unknown, SearchParams>,
  res: Response<{ results: FoundTrack[] }>,
  next: NextFunction,
) {
  try {
    //throw new HttpError({ code: 400, message: "Something went wrong" });
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
