import { Pool } from "pg";
import { describe, expect, it, beforeAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { dbConnection } from "../src/config/postgres";
import { appLoader } from "../src/loaders";
import { GENRES } from "../src/config/constants";
import { helpers } from "../test-helpers";
import { tracks } from "../test-helpers/seeds";

let pool: Pool;

beforeAll(async () => (pool = await dbConnection.open()));
beforeEach(async () => {
  await helpers.createGenres(pool, GENRES);
  for (const track of tracks) {
    await helpers.createTrack(pool, track);
  }
});

describe("GET /api/tracks/ids", () => {
  it("returns a JSON object containing track ids for the searched tracks", async () => {
    const response = await request(appLoader.expressApp)
      .post("/api/tracks/ids")
      .set("accept", "application/json")
      .set("content-type", "application/json")
      .send({ filePaths: tracks.map((track) => track.filePath) })
      .expect(200)
      .expect("content-type", /application\/json/);

    const dbResponse = await pool.query<{
      track_id: number;
      file_path: string;
    }>("SELECT track_id, file_path FROM track;");

    expect(response.body).toStrictEqual({
      results: dbResponse.rows.map(({ track_id, file_path }) => ({
        trackId: track_id,
        filePath: file_path,
      })),
    });
  });
});
