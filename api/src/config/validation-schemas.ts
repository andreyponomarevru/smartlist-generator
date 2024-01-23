import Joi from "joi";

const schemaTrackId = Joi.number()
  .positive()
  .integer()
  .min(1)
  .required()
  .messages({
    "number.base": `"trackId" must be a type of 'number'`,
    "number.integer": `"trackId" must be an integer`,
    "number.min": `"trackId" minimum value is "1"`,
    "any.required": `"trackId" is required`,
  });

const schemaSubplaylistId = Joi.number()
  .positive()
  .integer()
  .min(1)
  .required()
  .messages({
    "number.base": `"subplaylistId" must be a type of 'number'`,
    "number.integer": `"subplaylistId" must be an integer`,
    "number.min": `"subplaylistId" minimum value is "1"`,
    "any.required": `"subplaylistId" is required`,
  });

const schemaId = Joi.number().positive().integer().min(1).required().messages({
  "number.base": `"id" must be a type of 'number'`,
  "number.integer": `"id" must be an integer`,
  "number.min": `"id" minimum value is "1"`,
  "any.required": `"id" is required`,
});

export const schemaIdParam = Joi.object<{ id: number }>({
  id: schemaId,
});

export const schemaCreatePlaylist = Joi.object<{ name: string }>({
  name: Joi.string().min(1).max(255).required().messages({
    "string.base": `"name" should be a type of 'string'`,
    "number.min": `"name" min length is 1 symbol`,
    "number.max": `"name" max length is 255 symbols`,
    "any.required": `"name" is required`,
  }),
});

export const schemaAddTrackToPlaylist = Joi.object<{
  trackId: number;
  subplaylistId: number;
}>({
  trackId: schemaTrackId,
  subplaylistId: schemaSubplaylistId,
});

export const schemaUpdateTracksInPlaylist = Joi.array<
  {
    trackId: number;
    subplaylistId: number;
  }[]
>()
  .min(1)
  .items(
    Joi.object().keys({
      trackId: schemaTrackId,
      subplaylistId: schemaSubplaylistId,
    }),
  );

export const schemaRemoveTracksFromPlaylist = Joi.object<{
  id: number | number[];
}>({
  id: Joi.alternatives().try(
    Joi.array().items(Joi.number().min(1).required()).required(),
    Joi.number().integer().min(1).required(),
  ),
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
  exclude: Joi.alternatives().try(
    Joi.array().items(Joi.number().min(1).required()).optional(),
    Joi.number().integer().min(1).optional(),
  ),
});
