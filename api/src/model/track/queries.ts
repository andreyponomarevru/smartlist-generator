import format from "pg-format";
import { connectDB } from "../../config/postgres";
import { schemaCreateTrack } from "./validation-schemas";
import { TrackMetadataParser, logDBError } from "../../utils/utilities";
import { ValidatedTrack } from "../../types";
import { CreateSubplaylistDBResponse } from "../../types";
import { getTrackSubplaylistIds } from "./get-track-subplaylist-ids";

export async function create(filePath: string): Promise<void> {
  const trackMetadataParser = new TrackMetadataParser(filePath);
  const newTrack = await schemaCreateTrack.validateAsync(
    await trackMetadataParser.parseAudioFile(),
  );

  const pool = await connectDB();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert year
    const { year_id: yearId } = (
      await pool.query({
        text:
          "WITH \
           input_rows (year) AS (VALUES ($1::smallint)), \
           ins AS ( \
             INSERT INTO year (year) \
               SELECT year FROM input_rows \
             ON CONFLICT DO NOTHING \
             RETURNING year_id \
           ) \
         SELECT year_id FROM ins \
         \
         UNION ALL \
         \
         SELECT t.year_id FROM input_rows JOIN year AS t USING (year);",
        values: [newTrack.year],
      })
    ).rows[0];

    //
    // Insert track
    //
    const { track_id: trackId } = (
      await client.query({
        text:
          "INSERT INTO track (title, year_id, duration, file_path) \
           VALUES ($1, $2::numeric, $3, $4) \
           RETURNING track_id",
        values: [newTrack.title, yearId, newTrack.duration, newTrack.filePath],
      })
    ).rows[0];

    //
    // Assign track to subplaylist(s)
    //
    const subplaylists = (
      await pool.query<CreateSubplaylistDBResponse>({
        text: "SELECT subplaylist_id, name FROM subplaylist;",
      })
    ).rows.map((row) => ({
      subplaylistId: row.subplaylist_id,
      name: row.name,
    }));

    const trackSubplaylistIds = getTrackSubplaylistIds(subplaylists, {
      year: newTrack.year,
      genres: newTrack.genre,
    });

    for (const id of trackSubplaylistIds) {
      await client.query({
        text:
          "INSERT INTO\
            track_subplaylist (track_id, subplaylist_id)\
          VALUES\
            ($1, $2);",
        values: [trackId, id],
      });
    }

    //
    // Insert genres
    //
    for (const genre of newTrack.genre) {
      // TODO: verify this query, I think it can be simplified
      const { genre_id } = (
        await client.query({
          text:
            "\
					WITH \
            input_rows (name) AS ( VALUES ($1) ), \
            ins AS ( \
							INSERT INTO genre (name) \
                SELECT name FROM input_rows \
              ON CONFLICT DO NOTHING \
              RETURNING genre_id \
            ) \
          \
					SELECT genre_id FROM ins \
          \
          UNION ALL \
          \
					SELECT g.genre_id FROM input_rows \
          JOIN genre AS g USING (name);",
          values: [genre],
        })
      ).rows[0];

      const inserTrackGenreQuery = {
        text:
          "INSERT INTO track_genre (track_id, genre_id) \
				   VALUES ($1::integer, $2::integer) \
           ON CONFLICT DO NOTHING;",
        values: [trackId, genre_id],
      };
      await client.query(inserTrackGenreQuery);
    }

    // Insert artists

    for (const artist of newTrack.artist) {
      const { artist_id } = (
        await client.query({
          text:
            "\
					WITH \
						input_rows (name) AS (VALUES ($1)), \
						\
						ins AS ( \
							INSERT INTO artist (name) \
                SELECT name FROM input_rows \
              ON CONFLICT DO NOTHING \
              RETURNING artist_id \
						) \
          \
					SELECT artist_id FROM ins \
          \
          UNION ALL \
          \
					SELECT a.artist_id FROM input_rows \
					JOIN artist AS a USING (name);",
          values: [artist],
        })
      ).rows[0];

      await client.query({
        text:
          "INSERT INTO track_artist (track_id, artist_id) \
					 VALUES ($1::integer, $2::integer) \
           ON CONFLICT DO NOTHING",
        values: [trackId, artist_id],
      });
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    logDBError(
      `ROLLBACK. Error occured while adding the track "${newTrack.filePath}" to db.`,
      err,
    );
    throw err;
  } finally {
    client.release();
  }
}

export async function read() {}

export async function destroyAll() {
  const pool = await connectDB();

  try {
    await pool.query({
      text:
        "TRUNCATE\
          year,\
          track,\
          artist,\
          track_artist,\
          genre,\
          track_genre,\
          playlist,\
          subplaylist,\
          track_subplaylist,\
          track_playlist;",
    });
  } catch (err) {
    logDBError("An error occured while clearing all db tables.", err);
    throw err;
  }
}

/*
export async function excludeFromLib(trackId: number): Promise<number> {
  const pool = await connectDB();

  try {
    // Exclude tracks from the library
    const res = await pool.query<{ trackId: number }>({
      text:
        "UPDATE track SET is_excluded = true \
         WHERE track_id = $1 RETURNING track_id AS trackId",
      values: [trackId],
    });
    return res.rows[0].trackId;
  } catch (err) {
    logDBError("An error occured while excluding track from the db.", err);
    throw err;
  }
}
*/
