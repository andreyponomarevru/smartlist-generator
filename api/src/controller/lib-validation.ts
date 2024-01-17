import util from "util";
import express, { Request, Response, NextFunction } from "express";
import { traverseDirs } from "../utils/utilities";
import { MUSIC_LIB_DIR } from "../config/env";
import * as tracksModel from "../model/track/index";

const router = express.Router();

export async function validateLib(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tracksValidator = new tracksModel.TrackValidator();
    await traverseDirs(MUSIC_LIB_DIR, tracksValidator.validate);
    const validationResults = {
      errors: tracksValidator.errors,
      artist: {
        names: [...tracksValidator.db.artist].sort(),
        count: tracksValidator.db.artist.size,
      },
      year: {
        names: [...tracksValidator.db.year].sort(),
        count: tracksValidator.db.year.size,
      },
      genre: {
        names: [...tracksValidator.db.genre].sort(),
        count: tracksValidator.db.genre.size,
      },
    };
    res.json({ results: validationResults });
  } catch (err) {
    next(err);
  }
}

router.get("/api/lib/validation", validateLib);

export { router };
