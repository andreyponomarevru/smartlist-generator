import format, { string } from "pg-format";
import { connectDB } from "../../config/postgres";
import { logDBError } from "../../utils/utilities";
import { CreateSubplaylistDBResponse, GeneratedSubplaylist } from "../../types";
import { SUBPLAYLISTS } from "../../config/constants";

export async function createLookupTable(playlistNames: typeof SUBPLAYLISTS) {
  const pool = await connectDB();

  try {
    for (const name of playlistNames) {
      await pool.query<CreateSubplaylistDBResponse>({
        text: "INSERT INTO subplaylist (name) VALUES ($1);",
        values: [name],
      });
    }
  } catch (err) {
    logDBError("Error while inserting subplaylist", err);
    throw err;
  }
}

export async function generateSubplaylist({
  subplaylistId,
  limit,
  excludeTrackId,
}: {
  subplaylistId: number;
  limit: number;
  excludeTrackId: number[];
}): Promise<GeneratedSubplaylist[]> {
  const pool = await connectDB();

  try {
    const response = await pool.query<{
      track_id: number;
      title: string;
      duration: string;
      file_path: string;
      year: number;
      artist: string[];
      genre: string[];
    }>({
      text: `SELECT \
                * \
             FROM \
               view_track \
             WHERE \
               subplaylist_id = $1 \
             ${excludeTrackId.length === 0 ? "" : "AND track_id != ALL ($3)"} \
             LIMIT \
               $2;`,
      values:
        excludeTrackId.length === 0
          ? [subplaylistId, limit]
          : [subplaylistId, limit, excludeTrackId],
    });

    return response.rows.length === 0
      ? []
      : response.rows.map((row) => {
          return {
            trackId: row.track_id,
            title: row.title,
            duration: parseFloat(row.duration),
            filePath: row.file_path,
            year: row.year,
            artist: row.artist,
            genre: row.genre,
            subplaylistId,
          };
        });
  } catch (err) {
    logDBError("Error while generating subplaylist", err);
    throw err;
  }
}
