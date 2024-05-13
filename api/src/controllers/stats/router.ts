import express from "express";
import Joi from "joi";

import { statsController, GetTracksCountReqQuery } from "./controller";
import { validate } from "../../middlewares/validate";

export const statsRouter = express.Router().get(
  "/",
  validate(
    Joi.object<GetTracksCountReqQuery>({
      excluded: Joi.array().items(Joi.number().positive()).single().min(1),
    }).optional(),
    "query",
  ),
  statsController.gerTracksCountByGenre,
);
