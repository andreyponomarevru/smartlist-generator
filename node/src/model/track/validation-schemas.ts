import Joi from "joi";

import { Track } from "../../types";
import { GENRES } from "../../config/constants";

export const schemaCreateTrack = Joi.object<Track>({
  filePath: Joi.string().trim().min(1).max(255).messages({
    "string.base": '"filePath" should be a type of "string"',
    "string.empty": '"filePath" cannot be an empty string',
    "string.max": '"filePath" is longer than 255 characters',
  }),
  artist: Joi.array()
    .min(1)
    .unique()
    .items(
      Joi.string().trim().min(1).max(200).required().messages({
        "string.base": '"artist" item should be a type of "string"',
        "string.empty": '"artist" item cannot be an empty string',
        "string.max": '"artist" item is longer than 200 characters',
      }),
    )
    .messages({
      "array.min": '"artist" array should contains at least 1 item',
      "array.unique": '"artist" array should contains only unique values',
    }),
  duration: Joi.number().positive().min(1).messages({
    "number.base": '"duration" should be a type of number',
    "number.positive": '"duration" should be positive',
    "number.min": '"duration" minimum value is 1',
  }),
  title: Joi.string().trim().min(1).max(200).messages({
    "string.base": '"filePath" should be a type of "string"',
    "string.empty": '"filePath" cannot be an empty string',
    "string.max": '"filePath" is longer than 200 characters',
  }),
  genre: Joi.array()
    .min(1)
    .unique()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .max(200)
        .valid(...GENRES)
        .required()
        .messages({
          "string.base": '"genre" item should be a type of "string"',
          "string.empty": '"genre" item cannot be an empty string',
          "string.max": '"genre" item is longer than 200 characters',
          "any.only": '"genre" item doesn\'t match any allowed value',
        }),
    )
    .messages({
      "array.min": '"artist" array should contains at least 1 item',
      "array.unique": '"artist" array should contains only unique values',
    }),
  year: Joi.number()
    .positive()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .messages({
      "number.base": '"year" should be a type of number',
      "number.positive": '"year" should be positive',
      "number.min": '"year" minimum value is 1900',
      "number.max": `"year" maximum values is ${new Date().getFullYear() + 1}`,
    }),
}).options({ presence: "required" });
