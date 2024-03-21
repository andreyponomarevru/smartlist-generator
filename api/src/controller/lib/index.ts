import express from "express";

import { validate } from "../../middlewares/validate";
import { schemaIdParam, schemaLibPath } from "../../config/validation-schemas";
import { runValidation, getValidation, cancelValidation } from "./validations";
import { populateLib, destroyLib } from "./lib";

const router = express.Router();

router.post("/api/lib", populateLib);
router.delete("/api/lib", destroyLib);

router.post(
  "/api/lib/validations",
  validate(schemaLibPath, "body"),
  runValidation,
);
router.get(
  "/api/lib/validations/:id",
  validate(schemaIdParam, "params") as any,
  getValidation,
);
router.delete(
  "/api/lib/validations/:id",
  validate(schemaIdParam, "params") as any,
  cancelValidation,
);

export { router };
