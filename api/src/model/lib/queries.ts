import format from "pg-format";

import { connectDB } from "../../config/postgres";
import { logDBError } from "../../utils/utilities";

export async function createGenres(genres: string[] = []) {
  const pool = await connectDB();

  try {
    await pool.query({
      text: format(
        `INSERT INTO genre (genre_id, name) VALUES %L;`,
        genres.map((genre, index) => [index, genre]),
      ),
    });
  } catch (err) {
    logDBError("An error occured while clearing all db tables.", err);
    throw err;
  }
}

export async function destroyAll() {
  const pool = await connectDB();

  try {
    await pool.query({
      text: `
        TRUNCATE track, artist, track_artist, genre, track_genre;`,
    });
  } catch (err) {
    logDBError("An error occured while clearing all db tables.", err);
    throw err;
  }
}
