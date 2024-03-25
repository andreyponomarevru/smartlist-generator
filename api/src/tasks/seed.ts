import { traverseDirs } from "../utils/utilities";
import * as trackModel from "../model/track";
import { GENRES } from "../config/constants";
import { ProcessMessage } from "../types";

const libPath = process.argv[2];

(async () => {
  if (!process.send) throw new Error("process.send is undefined");

  await trackModel.createGenres(GENRES);
  await traverseDirs(libPath, trackModel.create);

  process.send({ name: "seeding", status: "success" } as ProcessMessage);
})();
