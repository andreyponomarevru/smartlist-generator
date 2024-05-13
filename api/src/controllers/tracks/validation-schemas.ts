import Joi from "joi";

import { FILTER_CONDITIONS } from "../../config/constants";
import { Filter } from "../../types";

export const schemaFilter = Joi.object<Filter>({
  name: Joi.string().valid("year", "genre"),
  condition: Joi.string().valid(...FILTER_CONDITIONS),
  value: Joi.array().items(Joi.number()).single(),
});
