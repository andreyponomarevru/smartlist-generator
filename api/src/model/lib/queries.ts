import { connectDB } from "../../config/postgres";
import { logDBError } from "../../utils/utilities";

export async function destroyAll() {
  const pool = await connectDB();

  try {
    await pool.query({
      text: `
        TRUNCATE
          year,
          track,
          artist,
          track_artist,
          genre,
          track_genre,
          playlist,
          track_playlist;`,
    });
  } catch (err) {
    logDBError("An error occured while clearing all db tables.", err);
    throw err;
  }
}
