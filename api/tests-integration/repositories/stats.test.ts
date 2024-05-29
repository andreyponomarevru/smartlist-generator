import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { Pool } from "pg";
import { GENRES } from "../../src/config/constants";
import { dbConnection } from "../../src/config/postgres";
import { statsRepo } from "../../src/repositories";
import { helpers } from "../../test-helpers";
import { tracks } from "../../test-helpers/seeds";

let pool: Pool;

beforeAll(async () => (pool = await dbConnection.open()));
beforeEach(async () => {
  await helpers.createGenres(pool, GENRES);
  for (const file of tracks) {
    await helpers.createTrack(pool, file);
  }
});

describe("statsRepo", () => {
  describe("countTracksByGenre", () => {
    it("returns tracks stats by genre", async () => {
      const result = await statsRepo.countTracksByGenre();

      expect(result.length).toBe(5);
      expect(result).toContainEqual({ count: 3, id: 3, name: "Ambient" });
      expect(result).toContainEqual({ count: 2, id: 10, name: "Dub" });
      expect(result).toContainEqual({ count: 1, id: 6, name: "Breakbeat" });
      expect(result).toContainEqual({ count: 1, id: 28, name: "UK Garage" });
      expect(result).toContainEqual({ count: 1, id: 21, name: "Psytrance" });
    });
  });

  describe("countTracksByYear", () => {
    it("returns tracks stats by year", async () => {
      const result = await statsRepo.countTracksByYear();

      expect(result.length).toBe(3);
      expect(result).toContainEqual({ count: 3, name: "2023" });
      expect(result).toContainEqual({ count: 1, name: "2014" });
      expect(result).toContainEqual({ count: 1, name: "1991" });
    });
  });
});
