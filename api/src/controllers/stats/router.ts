import express from "express";
import Joi from "joi";

import { statsController, GetTracksCountReqQuery } from "./controller";
import { validate } from "../../middlewares/validate";

export const statsRouter = express
  .Router()
  .get(
    "/genres",
    validate(
      Joi.object<GetTracksCountReqQuery>({
        excluded: Joi.array().items(Joi.number().positive().min(1)).single(),
      }).optional(),
      "query",
    ),
    statsController.gerTracksCountByGenre,
  )
  .get(
    "/years",
    validate(
      Joi.object<GetTracksCountReqQuery>({
        excluded: Joi.array().items(Joi.number().positive().min(1)).single(),
      }).optional(),
      "query",
    ),
    statsController.getTracksCountByYear,
  );
