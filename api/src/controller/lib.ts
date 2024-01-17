import express, { Request, Response, NextFunction } from "express";
import { traverseDirs } from "../utils/utilities";
import { MUSIC_LIB_DIR } from "../config/env";
import * as tracksModel from "../model/track/queries";
import * as subplatlistsModel from "../model/subplaylist/queries";
import { SUBPLAYLISTS } from "../config/constants";

const router = express.Router();

async function populateLib(req: Request, res: Response, next: NextFunction) {
  try {
    res.sendStatus(200);
    console.log("Starting populating db ...");
    await subplatlistsModel.create(SUBPLAYLISTS);
    await traverseDirs(MUSIC_LIB_DIR, tracksModel.create);
    console.log("Done. Database populated.");
  } catch (err) {
    next(err);
  }
}

async function destroyLib(req: Request, res: Response, next: NextFunction) {
  try {
    await tracksModel.destroyAll();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

router.post("/api/lib", populateLib);
router.delete("/api/lib", destroyLib);

export { router };
