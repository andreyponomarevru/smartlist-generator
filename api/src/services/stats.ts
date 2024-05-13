import { statsRepo } from "../repositories/stats";

import { Stats } from "../types";

export const statsService = {
  readStats: async function (excluded: number[]): Promise<Stats> {
    return {
      genres: await statsRepo.countTracksByGenre(excluded),
      years: await statsRepo.countTracksByYear(excluded),
    };
  },
};
