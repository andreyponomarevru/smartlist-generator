import express, { Request, Response, NextFunction } from "express";
import { traverseDirs } from "../utils/utilities";
import { MUSIC_LIB_DIR } from "../config/env";
import * as tracksModel from "../model/track/index";
import * as libModel from "../model/lib/queries";

const router = express.Router();

async function populateLib(req: Request, res: Response, next: NextFunction) {
  try {
    res.sendStatus(200);
    console.log("Starting populating db ...");
    await traverseDirs(MUSIC_LIB_DIR, tracksModel.create);
    console.log("Done. Database populated.");
  } catch (err) {
    next(err);
  }
}

async function destroyLib(req: Request, res: Response, next: NextFunction) {
  try {
    await libModel.destroyAll();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

export async function validateLib(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const createdDateTime = new Date().toISOString();
  let validationResults = null;

  try {
    /*
    res.setHeader("Retry-After", 30).json({
      createdDateTime,
      status: "running",
    });*/

    const tracksValidator = new tracksModel.TrackValidator();
    await traverseDirs(MUSIC_LIB_DIR, tracksValidator.validate);
    validationResults = {
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

    //if (validationResults && !isRunning) {
    res.json({
      createdDateTime,
      status: "succeeded",
      results: validationResults,
    });
    //return;
    //}
  } catch (err) {
    next(err);
  }
}

router.get("/api/lib/validation", validateLib);
router.post("/api/lib", populateLib);
router.delete("/api/lib", destroyLib);

export { router };
