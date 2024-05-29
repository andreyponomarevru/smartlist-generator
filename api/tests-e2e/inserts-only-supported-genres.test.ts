import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { Pool } from "pg";

import { GENRES } from "../src/config/constants";
import { dbConnection } from "../src/config/postgres";
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

describe("insert genres", () => {
  it.todo("accepts supported genres");
  it.todo("does not insert unsupported genres, throwing an error");
});
