import express, { Request, Response, NextFunction } from "express";
import { traverseDirs } from "../utils/utilities";
import { MUSIC_LIB_DIR } from "../config/env";
import * as track from "../model/track/queries";

const router = express.Router();

async function populateLib(req: Request, res: Response, next: NextFunction) {
  try {
    res.sendStatus(200);
    console.log("Starting populating db ...");
    await traverseDirs(MUSIC_LIB_DIR, track.create);
    console.log("Done. Database populated.");
  } catch (err) {
    next(err);
  }
}

async function destroyLib(req: Request, res: Response, next: NextFunction) {
  try {
    await track.destroyAll();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

router.post("/", populateLib);
router.delete("/", destroyLib);

export { router };
