import Joi from "joi";

export const schemaId = Joi.object<{ id: number }>({
  id: Joi.number().positive().integer().min(1).required().messages({
    "number.base": `"id" must be a type of 'number'`,
    "number.integer": `"id" must be an integer`,
    "number.min": `"id" minimum value is "1"`,
    "any.required": `"id" is required`,
  }),
});

export const schemaCreatePlaylist = Joi.object<{ name: string }>({
  name: Joi.string().min(1).max(255).required().messages({
    "string.base": `"name" should be a type of 'string'`,
    "number.min": `"name" min length is 1 symbol`,
    "number.max": `"name" max length is 255 symbols`,
    "any.required": `"name" is required`,
  }),
});

export const schemaUpdatePlaylist = Joi.object<{ name: string }>({
  name: Joi.string().min(1).max(255).required().messages({
    "string.base": `"name" should be a type of 'string'`,
    "number.min": `"name" min length is 1 symbol`,
    "number.max": `"name" max length is 255 symbols`,
    "any.required": `"name" is required`,
  }),
});

export const schemaGenerateSubplaylist = Joi.object<{
  id: number;
  limit: number;
  exclude: number[];
}>({
  id: schemaId,
  limit: Joi.number().integer().min(1).required().messages({
    "number.base": `"limit" must be a type of 'number'`,
    "number.integer": `"limit" must be an integer`,
    "number.min": `"limit" minimum value is "1"`,
    "any.required": `"limit" is required`,
  }),
  exclude: Joi.array().items(Joi.number()),
});
