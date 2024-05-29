import { Pool } from "pg";
import { describe, expect, it, beforeAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { dbConnection } from "../src/config/postgres";
import { appLoader } from "../src/loaders";
import { GENRES } from "../src/config/constants";
import { helpers } from "../test-helpers";
import { tracks } from "../test-helpers/seeds";
import { SearchParams } from "../src/utils";

let pool: Pool;

beforeAll(async () => (pool = await dbConnection.open()));
beforeEach(async () => {
  await helpers.createGenres(pool, GENRES);
  for (const track of tracks) {
    await helpers.createTrack(pool, track);
  }
});

describe("GET /api/tracks/search", () => {
  it("returns a JSON object containing a track matching the search query", async () => {
    const searchParams: SearchParams = {
      operator: "or",
      filters: [{ name: "year", condition: "less than or equal", value: 1991 }],
      excludeTracks: [],
    };

    const response = await request(appLoader.expressApp)
      .post("/api/tracks/search")
      .set("accept", "application/json")
      .set("content-type", "application/json")
      .send(searchParams);

    expect(response.body).toStrictEqual({
      results: [
        {
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
        },
      ],
    });
  });
});
