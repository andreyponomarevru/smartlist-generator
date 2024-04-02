import express from "express";
import Joi from "joi";

import {
  validationController,
  validationSSE,
  StartValidationReqBody,
} from "./validation-controller";
import {
  seedingController,
  seedingSSE,
  StartSeedingReqBody,
} from "./seeding-controller";
import { validate } from "../../middlewares/validate";
import { isLibPathExist } from "../../middlewares/is-libpath-exist";

export const validationRouter = express
  .Router()
  .get("/", validationSSE.init, validationController.getValidationStatusAsSSE)
  .post(
    "/",
    validate(
      Joi.object<StartValidationReqBody>({
        libPath: Joi.string().max(255).required(),
      }),
      "body",
    ),
    isLibPathExist,
    validationController.startValidation,
  )
  .delete("/", validationController.stopValidation);

export const seedingRouter = express
  .Router()
  .get("/", seedingSSE.init, seedingController.getSeedingStatusAsSSE)
  .post(
    "/",
    validate(
      Joi.object<StartSeedingReqBody>({
        libPath: Joi.string().max(255).required(),
      }),
      "body",
    ),
    seedingController.startSeeding,
  )
  .delete("/", seedingController.stopSeeding);
