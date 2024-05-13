import { traverseDirs } from "../utils";
import { trackService } from "../services/tracks";
import { GENRES } from "../config/constants";
import { OSProcessMessage } from "../types";

async function startProcess(tracks: typeof trackService) {
  const LIB_PATH = process.argv[2];

  if (!process.send) throw new Error("process.send is undefined");

  await tracks.destroyAll();
  await tracks.createGenres(GENRES);
  await traverseDirs(LIB_PATH, tracks.create);

  process.send!({ name: "seeding", status: "success" } as OSProcessMessage);
}

startProcess(trackService);
