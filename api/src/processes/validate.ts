import { traverseDirs } from "../utils/utilities";
import * as trackModel from "../models/track";
import { ProcessMessage } from "../types";

const LIB_PATH = process.argv[2];

const tracksValidator = new trackModel.validator.TrackValidator(
  trackModel.validationSchemas.schemaCreateTrack,
);

(async () => {
  await traverseDirs(LIB_PATH, await tracksValidator.validate);

  if (!process.send) throw new Error("process.send is undefined");
  process.send!({
    name: "validation",
    status: tracksValidator.errors.length === 0 ? "success" : "failure",
    result: {
      errors: tracksValidator.errors,
      artists: {
        names: [...tracksValidator.db.artist].sort(),
        count: tracksValidator.db.artist.size,
      },
      years: {
        names: [...tracksValidator.db.year].sort(),
        count: tracksValidator.db.year.size,
      },
      genres: {
        names: [...tracksValidator.db.genre].sort(),
        count: tracksValidator.db.genre.size,
      },
    },
  } as ProcessMessage);
})();
