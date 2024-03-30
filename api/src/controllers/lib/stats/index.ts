import { Request, Response, NextFunction } from "express";
import * as statsModel from "../../../models/lib/stats";

export async function gerTracksCountByGenre(
  req: Request<unknown, unknown, unknown, { excluded: number[] }>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json({
      results: await statsModel.queries.countTracksByGenre(req.query.excluded),
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
    (await statsModel.queries.countTracksByYear(req.query.excluded)).reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ),
  );
  try {
    res.json({
      results: await statsModel.queries.countTracksByYear(req.query.excluded),
    });
  } catch (err) {
    next(err);
  }
}
