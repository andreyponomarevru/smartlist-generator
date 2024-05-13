export * from "./validation-schemas";
export * from "./track-validator";

import { tracksRepo, libRepo } from "../../repositories";
import { type SearchParams } from "../../utils/query-builder";
import { GENRES } from "../../config/constants";
import { schemaCreateTrack } from "./validation-schemas";
import { parseAudioFile } from "./parse-audio-file";

export const trackService = {
  create: async function (filePath: string) {
    const parsedTrack = await parseAudioFile(filePath);
    const validTrack = await schemaCreateTrack.validateAsync(parsedTrack);
    tracksRepo.create(validTrack);
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
    await libRepo.destroyAll();
  },

  createGenres: async function (genres: typeof GENRES) {
    await libRepo.createGenres(genres);
  },
};
