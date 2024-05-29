import { beforeAll, describe, expect, it } from "@jest/globals";
import { Pool } from "pg";

import { GENRES } from "../../src/config/constants";
import { dbConnection } from "../../src/config/postgres";
import { libRepo } from "../../src/repositories";
import { helpers } from "../../test-helpers";
import { tracks } from "../../test-helpers/seeds";

let pool: Pool;

beforeAll(async () => (pool = await dbConnection.open()));

describe("libRepo", () => {
  describe("createGenres", () => {
    it("inserts genres in db", async () => {
      await libRepo.createGenres(GENRES);
      const response = await pool.query<{ genre_id: number; name: string }[]>(
        "SELECT * FROM genre;",
      );

      expect(response.rowCount).toBe(GENRES.length);
      expect(response.rows).toStrictEqual(
        GENRES.map((g) => ({ genre_id: g.id, name: g.name })),
      );
    });
  });

  describe("destroyAll", () => {
    it("clears all music lib-related tables", async () => {
      const initialData = await pool.query(
        "SELECT * FROM genre, artist, track, track_genre, track_artist;",
      );

      expect(initialData.rowCount).toBe(0);

      await helpers.createGenres(pool, GENRES);
      for (const track of tracks) {
        await helpers.createTrack(pool, track);
      }

      await libRepo.destroyAll();

      const genre = await pool.query("SELECT * FROM genre;");
      const artist = await pool.query("SELECT * FROM artist;");
      const track = await pool.query("SELECT * FROM track;");
      const trackGenre = await pool.query("SELECT * FROM track_genre;");
      const trackArtist = await pool.query("SELECT * FROM track_artist;");
      expect(genre.rows).toStrictEqual([]);
      expect(artist.rows).toStrictEqual([]);
      expect(track.rows).toStrictEqual([]);
      expect(trackGenre.rows).toStrictEqual([]);
      expect(trackArtist.rows).toStrictEqual([]);
    });

    it("resets auto-incoremented id value to 1 for 'track' table", async () => {
      const response = await pool.query(
        `INSERT INTO track (title, year, duration, file_path) VALUES ('Chill out', 1990, 25742.2457, '/path/to/file.flac') RETURNING track_id;`,
      );

      expect(response.rowCount).toBe(1);
      expect(response.rows[0]).toEqual({ track_id: 1 });
    });

    it("resets auto-incoremented id value to 1 for 'artist' table", async () => {
      const response = await pool.query(
        "INSERT INTO artist (name) VALUES ('KLF') RETURNING artist_id;",
      );

      expect(response.rowCount).toBe(1);
      expect(response.rows[0]).toEqual({ artist_id: 1 });
    });
  });
});
