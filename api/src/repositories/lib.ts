import format from "pg-format";

import { dbConnection } from "../config/postgres";
import { logDBError } from "../utils";
import { GENRES } from "../config/constants";

export const libRepo = {
  createGenres: async function (genres: typeof GENRES) {
    const pool = await dbConnection.open();

    try {
      await pool.query({
        text: format(
          `INSERT INTO genre (genre_id, name) VALUES %L;`,
          genres.map(({ id, name }) => [id, name]),
        ),
      });
    } catch (err) {
      logDBError("An error occured while adding genres to db", err);
      throw err;
    }
  },

  destroyAll: async function () {
    const pool = await dbConnection.open();

    try {
      await pool.query({
        text: `
          TRUNCATE track, artist, track_artist, genre, track_genre;`,
      });
      // Reset Postgres auto-increment id value to 0
      await pool.query({
        text: `ALTER SEQUENCE track_track_id_seq RESTART;`,
      });
      await pool.query({
        text: `ALTER SEQUENCE artist_artist_id_seq RESTART;`,
      });
    } catch (err) {
      logDBError("An error occured while clearing all db tables.", err);
      throw err;
    }
  },
};
