import { traverseDirs } from "../utils";
import { TrackValidator, schemaCreateTrack } from "../services/tracks";
import { ProcessMessage } from "../types";

const LIB_PATH = process.argv[2];

const tracksValidator = new TrackValidator(schemaCreateTrack);

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
