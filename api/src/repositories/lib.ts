import format from "pg-format";
import { dbConnection } from "../config/postgres";
import { logDBError } from "../utils";
import { GENRES } from "../config/constants";

export const libRepo = {
  createGenres: async function (genres: typeof GENRES) {
    const pool = await dbConnection.open();

    try {
      await pool.query(
        format(
          `INSERT INTO genre (genre_id, name) VALUES %L;`,
          genres.map(({ id, name }) => [id, name]),
        ),
      );
    } catch (err) {
      logDBError("An error occured while adding genres to db", err);
      throw err;
    }
  },

  destroyAll: async function () {
    const pool = await dbConnection.open();

    try {
      await pool.query(
        `TRUNCATE track, artist, track_artist, genre, track_genre;`,
      );
      // Reset Postgres auto-increment id value to 0. Just to avoid long id numbers for tables who's records dropped and reinserted regularly
      await pool.query(`ALTER SEQUENCE track_track_id_seq RESTART;`);
      await pool.query(`ALTER SEQUENCE artist_artist_id_seq RESTART;`);
    } catch (err) {
      logDBError("An error occured while clearing all db tables.", err);
      throw err;
    }
  },
};
