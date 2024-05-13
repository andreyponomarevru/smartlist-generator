import { Request, Response, NextFunction } from "express";

import { statsService } from "../../services/stats";
import { wrapResponse } from "../../utils";
import { Stats } from "../../types";

export type GetTracksCountReqQuery = { excluded: number[] };

export const statsController = {
  gerTracksCountByGenre: async function (
    req: Request<unknown, unknown, unknown, GetTracksCountReqQuery>,
    res: Response<{ results: Stats }>,
    next: NextFunction,
  ) {
    try {
      res.json(wrapResponse(await statsService.readStats(req.query.excluded)));
    } catch (err) {
      next(err);
    }
  },
};
