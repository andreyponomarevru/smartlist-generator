import { beforeAll, describe, expect, it } from "@jest/globals";
import { Pool } from "pg";

import { GENRES } from "../../src/config/constants";
import { dbConnection } from "../../src/config/postgres";
import { tracksRepo } from "../../src/repositories";
import { helpers } from "../../test-helpers";
import { DBResponseFoundTrack } from "../../src/types";
import { SearchParams } from "../../src/utils";
import { tracks } from "../../test-helpers/seeds";

let pool: Pool;

beforeAll(async () => (pool = await dbConnection.open()));

describe("tracksRepo", () => {
  describe("create", () => {
    it("creates a new track", async () => {
      await helpers.createGenres(pool, GENRES);
      await tracksRepo.create(tracks[0]);

      const track = await pool.query<DBResponseFoundTrack>(
        "SELECT * FROM track;",
      );
      expect(track.rowCount).toBe(1);
      expect(track.rows).toStrictEqual([
        {
          title: tracks[0].title,
          year: tracks[0].year,
          file_path: tracks[0].filePath,
          duration: tracks[0].duration.toString(),
          track_id: expect.any(Number),
        },
      ]);

      const artists = await pool.query<{ artist_id: number; name: string }>(
        "SELECT * FROM artist;",
      );
      expect(artists.rowCount).toBe(1);
      expect(artists.rows).toStrictEqual([
        { artist_id: expect.any(Number), name: tracks[0].artists[0] },
      ]);

      const genres = await pool.query<{ artist_id: number; name: string }>(
        "SELECT * FROM genre WHERE name = $1;",
        [tracks[0].genres[0]],
      );
      expect(genres.rows[0]).toStrictEqual({
        genre_id: expect.any(Number),
        name: tracks[0].genres[0],
      });
    });

    it("throws an error on attempt to insert track with unsupported genre", async () => {
      const result = async () =>
        await tracksRepo.create({
          ...tracks[0],
          genres: ["Unsupported genre"],
        });

      await expect(result).rejects.toThrow(
        "'Unsupported genre' is not a valid genre name",
      );
    });
  });

  describe("findFilePathById", () => {
    it("finds a file path by track id", async () => {
      const filePath = "/path/to/file.mp3";
      const response = await pool.query<{ track_id: number }>(
        `INSERT INTO track (year, title, duration, file_path) 
         VALUES (1995, 'Eternity', 57578.457, '${filePath}') 
         RETURNING track_id;`,
      );

      const result = await tracksRepo.findFilePathById(
        response.rows[0].track_id,
      );

      expect(result).toEqual(filePath);
    });
  });

  describe("find", () => {
    it("finds a tracks by search params", async () => {
      await helpers.createGenres(pool, GENRES);
      for (const track of tracks) {
        await helpers.createTrack(pool, track);
      }
      const searchParams: SearchParams = {
        operator: "or",
        filters: [
          { name: "year", condition: "less than or equal", value: 1991 },
        ],
        excludeTracks: [],
      };

      const result = await tracksRepo.find(searchParams);

      expect(result.length).toBe(1);
      expect(result[0]).toStrictEqual({
        trackId: expect.any(Number),
        artists: tracks[4].artists,
        duration: tracks[4].duration,
        filePath: tracks[4].filePath,
        genreIds: [
          GENRES.find((item) => item.name === tracks[4].genres[0])?.id,
        ],
        genres: tracks[4].genres,
        title: tracks[4].title,
        year: tracks[4].year,
      });
    });
  });

  describe("findIdsByFilePaths", () => {
    it("finds track ids by file paths", async () => {
      const filePath = "/path/to/file.mp3";
      const response = await pool.query<{ track_id: number }>(
        `INSERT INTO track (year, title, duration, file_path) 
         VALUES (1995, 'Eternity', 57578.457, '${filePath}') 
         RETURNING track_id;`,
      );

      const result = await tracksRepo.findIdsByFilePaths([filePath]);

      expect(result).toStrictEqual([
        { trackId: response.rows[0].track_id, filePath },
      ]);
    });
  });
});
