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

describe("GET /stats", () => {
  it("returns a JSON object containing lib stats", async () => {
    const response = await request(appLoader.expressApp)
      .get("/api/stats")
      .set("accept", "application/json")
      .set("content-type", "application/json")
      .expect(200)
      .expect("content-type", /application\/json/);

    expect(response.body).toStrictEqual({
      results: {
        genres: [
          { count: 3, id: 3, name: "Ambient" },
          { count: 2, id: 10, name: "Dub" },
          { count: 1, id: 6, name: "Breakbeat" },
          { count: 1, id: 28, name: "UK Garage" },
          { count: 1, id: 21, name: "Psytrance" },
        ],
        years: [
          { count: 3, name: "2023" },
          { count: 1, name: "2014" },
          { count: 1, name: "1991" },
        ],
      },
    });
  });
});
