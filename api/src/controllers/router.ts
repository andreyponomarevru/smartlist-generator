import express from "express";

import { validationRouter } from "./processes/router";
import { seedingRouter } from "./processes/router";
import { statsRouter } from "./stats/router";
import { tracksRouter } from "./tracks/router";

const apiRouter = express
  .Router()
  .use("/processes/validation", validationRouter)
  .use("/processes/seeding", seedingRouter)
  .use("/stats", statsRouter)
  .use("/tracks", tracksRouter);

export { apiRouter };
