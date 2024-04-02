import { Request, Response, NextFunction } from "express";

import { SearchParams } from "../../utils/query-builder";
import { FoundTrack } from "../../types";
import { wrapResponse } from "../../utils";
import { trackService } from "../../services/tracks";

export type GetTrackIdsByFilePathsReqBody = { filePaths: string[] };

export const tracksController = {
  findTrack: async function (
    req: Request<unknown, unknown, SearchParams>,
    res: Response<{ results: FoundTrack[] }>,
    next: NextFunction,
  ) {
    try {
      const searchParams = req.body;
      res.json(wrapResponse(await trackService.find(searchParams)));
    } catch (err) {
      next(err);
    }
  },

  getTrackIdsByFilePaths: async function (
    req: Request<unknown, unknown, GetTrackIdsByFilePathsReqBody>,
    res: Response<{ results: { trackId: number; filePath: string }[] }>,
    next: NextFunction,
  ) {
    try {
      const { filePaths } = req.body;
      res.json(wrapResponse(await trackService.findIdsByFilePaths(filePaths)));
    } catch (err) {
      next(err);
    }
  },
};
