import express from "express";
import Joi from "joi";

import { tracksController, GetTrackIdsByFilePathsReqBody } from "./controller";
import { schemaFilter } from "./validation-schemas";
import { validate } from "../../middlewares/validate";
import { getTrackFilePath } from "../../middlewares/get-track-file-path";
import { streamChunked } from "../../middlewares/stream-chunked";
import { SearchParams } from "../../utils/query-builder";
import { FILTER_OPERATOR } from "../../config/constants";
import { GetTrackFilePathReqParams } from "../../middlewares/get-track-file-path";

export const tracksRouter = express
  .Router()
  .post(
    "/search",
    validate(
      Joi.object<SearchParams>({
        operator: Joi.string().valid(...FILTER_OPERATOR),
        filters: Joi.array().items(schemaFilter),
        excludeTracks: Joi.array()
          .items(Joi.number().positive().optional())
          .min(0)
          .required(),
      }),
      "body",
    ),
    tracksController.findTrack,
  )
  .post(
    "/ids",
    validate(
      Joi.object<GetTrackIdsByFilePathsReqBody>({
        filePaths: Joi.array().items(Joi.string()),
      }),
      "body",
    ),
    tracksController.getTrackIdsByFilePaths,
  )
  .get(
    "/:id/stream",
    validate(
      Joi.object<GetTrackFilePathReqParams>({
        id: Joi.number().positive().integer().min(0).required(),
      }),
      "params",
    ),
    getTrackFilePath,
    streamChunked,
  );
