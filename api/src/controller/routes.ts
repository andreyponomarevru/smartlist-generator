import express from "express";

import { validate } from "../middlewares/validate";
import * as jobsController from "./tasks";
import {
  schemaLibPath,
  schemaIdParam,
  schemaFindTrackReqBody,
  schemaFindTrackIdsByFilePathsReqBody,
  schemaGetStats,
} from "./validation-schemas";
import * as tracksController from "./tracks";
import * as statsController from "./lib/stats";
import * as jobController from "./tasks";
import { isLibPathExist } from "../middlewares/is-libpath-exist";

const router = express.Router();

//router.get("/test", tracksController.handleSSE);

// Tasks

router.post(
  "/tasks/validation",
  validate(schemaLibPath, "body"),
  isLibPathExist,
  jobController.startValidation,
);
router.get("/tasks/validation", jobsController.getValidation);
router.delete("/tasks/validation", jobsController.stopValidation);

router.post(
  "/tasks/seeding",
  validate(schemaLibPath, "body"),
  jobsController.startSeeding,
);
router.get("/tasks/seeding", jobsController.getSeeding);
router.delete("/tasks/seeding", jobsController.stopSeeding);

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
