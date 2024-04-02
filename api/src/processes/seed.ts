import { traverseDirs } from "../utils";
import { trackService } from "../services/tracks";
import { GENRES } from "../config/constants";
import { ProcessMessage } from "../types";

const libPath = process.argv[2];

(async () => {
  if (!process.send) throw new Error("process.send is undefined");

  await trackService.createGenres(GENRES);
  await traverseDirs(libPath, trackService.create);

  process.send!({ name: "seeding", status: "success" } as ProcessMessage);
})();
