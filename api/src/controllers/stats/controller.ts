import { Request, Response, NextFunction } from "express";
import { statsService } from "../../services/stats";
import { wrapResponse } from "../../utils";

export type GetTracksCountReqQuery = { excluded: number[] };

export const statsController = {
  gerTracksCountByGenre: async function (
    req: Request<unknown, unknown, unknown, GetTracksCountReqQuery>,
    res: Response<{ results: { id: number; name: string; count: number }[] }>,
    next: NextFunction,
  ) {
    try {
      res.json(
        wrapResponse(await statsService.countTracksByGenre(req.query.excluded)),
      );
    } catch (err) {
      next(err);
    }
  },

  getTracksCountByYear: async function (
    req: Request<unknown, unknown, unknown, GetTracksCountReqQuery>,
    res: Response<{ results: { name: string; count: number }[] }>,
    next: NextFunction,
  ) {
    try {
      res.json(
        wrapResponse(await statsService.countTracksByYear(req.query.excluded)),
      );
    } catch (err) {
      next(err);
    }
  },
};
