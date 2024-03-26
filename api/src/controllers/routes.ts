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

const router = express.Router();

//router.get("/test", tracksController.handleSSE);

// Tasks

router.post(
  "/processes/validation",
  validate(schemaLibPath, "body"),
  isLibPathExist,
  processesController.startValidation,
);
router.get(
  "/processes/validation",
  validationSSE.init,
  processesController.getValidationStatusAsSSE,
);
router.delete("/processes/validation", processesController.stopValidation);

router.post(
  "/processes/seeding",
  validate(schemaLibPath, "body"),
  processesController.startSeeding,
);
router.get("/processes/seeding", processesController.getSeedingStatusAsSSE);
router.delete("/processes/seeding", processesController.stopSeeding);

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
  tracksController.streamTrack,
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
