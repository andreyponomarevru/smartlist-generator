import { traverseDirs } from "../utils";
import { TrackValidator, schemaCreateTrack } from "../services/tracks";
import { OSProcessMessage } from "../types";
import { parseAudioFile } from "../services/tracks/parse-audio-file";

export async function startProcess(trackValidator: TrackValidator) {
  const LIB_PATH = process.argv[2];

  await traverseDirs(LIB_PATH, async (filePath: string) => {
    await trackValidator.validate(await parseAudioFile(filePath));
  });

  if (!process.send) throw new Error("process.send is undefined");

  process.send!({
    name: "validation",
    status: trackValidator.errors.length === 0 ? "success" : "failure",
    result: {
      errors: trackValidator.errors,
      artists: {
        names: [...trackValidator.stats.artist].sort(),
        count: trackValidator.stats.artist.size,
      },
      years: {
        names: [...trackValidator.stats.year].sort(),
        count: trackValidator.stats.year.size,
      },
      genres: {
        names: [...trackValidator.stats.genre].sort(),
        count: trackValidator.stats.genre.size,
      },
    },
  } as OSProcessMessage);
}

(async () => await startProcess(new TrackValidator(schemaCreateTrack)))();
