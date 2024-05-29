import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import { Pool } from "pg";

import { GENRES } from "../src/config/constants";
import { dbConnection } from "../src/config/postgres";
import { helpers } from "../test-helpers/index";
import { tracks } from "../test-helpers/seeds";

let pool: Pool;

beforeAll(async () => (pool = await dbConnection.open()));
beforeEach(async () => {
  await helpers.createGenres(pool, GENRES);
  for (const track of tracks) {
    await helpers.createTrack(pool, track);
  }
});

describe("insert genres", () => {
  it.todo("inserts only supported genres");
  it.todo("throws an error on unsupported genres");
});

// You should include libPath in request body (but beforethis edit the docker-compose.test.yml and define volume with test data and copy several tracks in project dir, to make the test realistic): await request.post("/api/...").send({ libPath: "/tracks" })
