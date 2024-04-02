import { Request, Response, NextFunction } from "express";

import { trackService } from "../services/tracks";
import { HttpError } from "../utils";

export type GetTrackFilePathReqParams = { id: number };

export async function getTrackFilePath(
  req: Request<GetTrackFilePathReqParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const trackFilePath = await trackService.findFilePathById(req.params.id);
    if (!trackFilePath) {
      throw new HttpError({
        code: 404,
        message: `There is no track with id ${req.params.id} (either such track never existed or it was deleted from disk)`,
      });
    }
    res.locals.trackFilePath = trackFilePath;
    next();
  } catch (err) {
    next(err);
  }
}
