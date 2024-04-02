import { statsRepo } from "../repositories/stats";

export const statsService = {
  countTracksByGenre: async function (excluded: number[]) {
    return await statsRepo.countTracksByGenre(excluded);
  },
  countTracksByYear: async function (excluded: number[]) {
    return await statsRepo.countTracksByYear(excluded);
  },
};
