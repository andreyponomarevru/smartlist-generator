import express from "express";

import { validate } from "../middlewares/validate";
import {
  schemaLibPath,
  schemaIdParam,
  schemaFindTrackReqBody,
  schemaFindTrackIdsByFilePathsReqBody,
  schemaGetStats,
} from "./validation-schemas";
import * as tracksController from "./tracks";
import * as statsController from "./lib/stats";
import * as processesController from "./processes";
import { validationSSE } from "./processes/validation";
import { isLibPathExist } from "../middlewares/is-libpath-exist";
import { streamChunked } from "../middlewares/stream-chunked";

const router = express.Router();

//router.get("/test", tracksController.handleSSE);

// Tasks

router.post(
  "/processes/validation",
  validate(schemaLibPath, "body"),
  isLibPathExist,
  processesController.validation.startValidation,
);
router.get(
  "/processes/validation",
  validationSSE.init,
  processesController.validation.getValidationStatusAsSSE,
);
router.delete(
  "/processes/validation",
  processesController.validation.stopValidation,
);

router.post(
  "/processes/seeding",
  validate(schemaLibPath, "body"),
  processesController.seeding.startSeeding,
);
router.get(
  "/processes/seeding",
  processesController.seeding.getSeedingStatusAsSSE,
);
router.delete("/processes/seeding", processesController.seeding.stopSeeding);

// Tracks

router.post(
  "/tracks/search",
  validate(schemaFindTrackReqBody, "body"),
  tracksController.findTrack,
);

router.post(
  "/tracks/ids",
  validate(schemaFindTrackIdsByFilePathsReqBody, "body"),
  tracksController.getTrackIdsByFilePaths,
);

router.get(
  "/tracks/:id/stream",
  validate(schemaIdParam, "params"),
  tracksController.getTrackFilePath,
  streamChunked,
);

// Lib

router.get(
  "/lib/stats/genres",
  validate(schemaGetStats, "query"),
  statsController.gerTracksCountByGenre,
);
router.get(
  "/lib/stats/years",
  validate(schemaGetStats, "query"),
  statsController.getTracksCountByYear,
);

export { router };
