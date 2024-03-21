import { Request, Response, NextFunction } from "express";

import * as libModel from "../../model/lib/queries";
import { GENRES } from "../../config/constants";

export async function populateLib(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.sendStatus(202);
  console.log("Starting populating db ...");

  try {
    await libModel.createGenres(GENRES);
    // await traverseDirs(libPath, tracksModel.create);

    console.log("Done. Database populated.");
  } catch (err) {
    next(err);
  }
}

export async function destroyLib(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await libModel.destroyAll();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
