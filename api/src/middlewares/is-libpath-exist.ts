import { Request, Response, NextFunction } from "express";

import { HttpError, isFileExist } from "../utils";

export async function isLibPathExist(
  req: Request<unknown, unknown, { libPath: string }>,
  res: Response,
  next: NextFunction,
) {
  if (req.body.libPath && (await isFileExist(req.body.libPath))) {
    next();
  } else {
    next(
      new HttpError({
        code: 400,
        message: "Incorrect lib path. Such dir doesn't exist",
      }),
    );
  }
}
