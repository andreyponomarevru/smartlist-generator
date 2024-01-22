import util from "util";
import express, { Request, Response, NextFunction } from "express";
import * as subplaylistsModel from "../model/subplaylist/queries";
import { GeneratedSubplaylist } from "../types";
import { validate } from "../middlewares/validate";
import {
  schemaGenerateSubplaylist,
  schemaId,
} from "../config/validation-schemas";

const router = express.Router();

export async function getTracksFromSubplaylist(
  req: Request<{ id: number }, any, any, { limit: number; exclude: number[] }>,
  res: Response<{ results: GeneratedSubplaylist[] }>,
  next: NextFunction,
) {
  try {
    req.query;
    req.params;
    res.status(201).json({
      results: await subplaylistsModel.generateSubplaylist({
        subplaylistId: req.params.id,
        limit: req.query.limit,
        excludeTrackId: req.query.exclude
          ? Array.isArray(req.query.exclude)
            ? req.query.exclude
            : [req.query.exclude]
          : [],
      }),
    });
    res.end();
  } catch (err) {
    next(err);
  }
}

router.get(
  "/api/subplaylists/:id",
  validate(schemaId, "params"),
  validate(schemaGenerateSubplaylist, "query"),
  getTracksFromSubplaylist as any,
);

export { router };
