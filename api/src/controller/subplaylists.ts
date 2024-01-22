import util from "util";
import express, { Request, Response, NextFunction } from "express";
import * as subplaylistsModel from "../model/subplaylist/queries";
import { GeneratedSubplaylist, GenerateSubplaylistRequest } from "../types";
import { validate } from "../middlewares/validate";
import { schemaGenerateSubplaylist } from "../config/validation-schemas";

const router = express.Router();

export async function getTracksFromSubplaylist(
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    GenerateSubplaylistRequest
  >,
  res: Response<{ results: GeneratedSubplaylist[] }>,
  next: NextFunction,
) {
  try {
    res.status(201).json({
      results: await subplaylistsModel.generateSubplaylist({
        subplaylistId: (req.query.id as unknown) as number,
        limit: (req.query.limit as unknown) as number,
        excludeTrackId: ((req.query.exclude as unknown) as number[]) || [],
      }),
    });
    res.end();
  } catch (err) {
    next(err);
  }
}

router.get(
  "/api/subplaylists",
  validate(schemaGenerateSubplaylist, "query"),
  getTracksFromSubplaylist,
);

export { router };
