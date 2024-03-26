import { Request, Response, NextFunction } from "express";
import * as statsModel from "../../../model/lib/stats/queries";

export async function gerTracksCountByGenre(
  req: Request<unknown, unknown, unknown, { excluded: number[] }>,
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
  req: Request<unknown, unknown, unknown, { excluded: number[] }>,
  res: Response,
  next: NextFunction,
) {
  console.log(
    (await statsModel.countTracksByYear(req.query.excluded || [])).reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ),
  );
  try {
    res.json({
      results: await statsModel.countTracksByYear(req.query.excluded || []),
    });
  } catch (err) {
    next(err);
  }
}
