export * from "./validation-schemas";
export * from "./validator";

import { tracksRepo } from "../../repositories";
import { SearchParams } from "../../utils/query-builder";
import { GENRES } from "../../config/constants";
import { schemaCreateTrack } from "./validation-schemas";
import { parseAudioFile } from "./validator";

export const trackService = {
  create: async function (filePath: string) {
    tracksRepo.create(
      await schemaCreateTrack.validateAsync(await parseAudioFile(filePath)),
    );
  },

  find: async function (searchParams: SearchParams) {
    return await tracksRepo.find(searchParams);
  },

  findIdsByFilePaths: async function (filePaths: string[]) {
    return await tracksRepo.findIdsByFilePaths(filePaths);
  },

  findFilePathById: async function (trackId: number) {
    return await tracksRepo.findFilePathById(trackId);
  },

  destroyAll: async function () {
    await tracksRepo.destroyAll();
  },

  createGenres: async function (genres: typeof GENRES) {
    await tracksRepo.createGenres(genres);
  },
};
