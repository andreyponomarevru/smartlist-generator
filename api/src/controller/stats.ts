import express, { Request, Response, NextFunction } from "express";
import * as statsModel from "../model/stats/queries";
import { validate } from "../middlewares/validate";
import { getStats } from "../config/validation-schemas";

const router = express.Router();

export async function gerTracksCountByGenre(
  req: Request<any, any, any, { excluded: number[] }>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json({
      results: await statsModel.countTracksByGenre(req.query.excluded || []),
    });
  } catch (err) {
    next(err);
  }
}

export async function getTracksCountByYear(
  req: Request<any, any, any, { excluded: number[] }>,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log(await statsModel.countTracksByYear(req.query.excluded || []));
    res.json({
      results: await statsModel.countTracksByYear(req.query.excluded || []),
    });
  } catch (err) {
    next(err);
  }
}

router.get(
  "/api/lib/stats/genres",
  validate(getStats, "query") as any,
  gerTracksCountByGenre,
);
router.get(
  "/api/lib/stats/years",
  validate(getStats, "query") as any,
  getTracksCountByYear,
);

export { router };
