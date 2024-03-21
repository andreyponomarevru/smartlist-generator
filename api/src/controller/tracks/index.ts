import express from "express";

import { validate } from "../../middlewares/validate";
import {
  schemaIdParam,
  schemaFindTrackReqBody,
  schemaFindTrackIdsByFilePathsReqBody,
} from "../../config/validation-schemas";
import { getTrackIdsByFilePaths, getTrack, stream } from "./tracks";

const router = express.Router();

router.get(
  "/api/tracks/:id/stream",
  validate(schemaIdParam, "params"),
  stream as any,
);
router.post("/api/tracks", validate(schemaFindTrackReqBody, "body"), getTrack);
router.post(
  "/api/tracks/searches",
  validate(schemaFindTrackIdsByFilePathsReqBody, "body"),
  getTrackIdsByFilePaths,
);

export { router };
