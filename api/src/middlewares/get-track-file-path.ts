import { Request, Response, NextFunction } from "express";

import * as trackModel from "../models/track";
import { HttpError } from "../utils/error";

export async function getTrackFilePath(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const trackFilePath = await trackModel.queries.findFilePathById(
      req.params.id,
    );
    if (!trackFilePath) {
      throw new HttpError({ code: 404 });
    }
    res.locals.trackFilePath = trackFilePath;
    next();
  } catch (err) {
    next(err);
  }
}
