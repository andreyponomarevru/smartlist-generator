import { dbConnection } from "../config/postgres";
import { logDBError } from "../utils";
import { type SearchParams, buildSQLQuery } from "../utils/query-builder";
import { DBResponseFoundTrack, FoundTrack, ParsedTrack } from "../types";
import { GENRES } from "../config/constants";

export const tracksRepo = {
  create: async function (newTrack: ParsedTrack): Promise<void> {
    const pool = await dbConnection.open();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { track_id: trackId } = (
        await client.query<{ track_id: number }>(
          `INSERT INTO track (title, year, duration, file_path) 
           VALUES ($1, $2, $3, $4) 
           RETURNING track_id`,
          [newTrack.title, newTrack.year, newTrack.duration, newTrack.filePath],
        )
      ).rows[0];

      for (const genreName of newTrack.genres) {
        const validGenre = GENRES.find((valid) => valid.name === genreName);
        if (!validGenre) {
          throw new Error(`'${genreName}' is not a valid genre name`);
        }

        await client.query(
          `INSERT INTO track_genre 
             (track_id, genre_id) 
           VALUES 
             ($1::integer, $2::integer) 
           ON CONFLICT DO NOTHING;`,
          [trackId, validGenre.id],
        );
      }

      // Insert artists

      for (const artist of newTrack.artists) {
        let artistId: number | null = null;

        const response = await client.query<{ artist_id: number }>(
          `INSERT INTO artist (name) VALUES ($1)
           ON CONFLICT DO NOTHING RETURNING artist_id`,
          [artist],
        );
        if (response.rowCount !== 0) {
          artistId = response.rows[0].artist_id;
        } else {
          const response = await client.query<{ artist_id: number }>(
            `SELECT artist_id FROM artist WHERE name = $1;`,
            [artist],
          );
          artistId = response.rows[0].artist_id;
        }

        await client.query(
          `INSERT INTO track_artist (track_id, artist_id) 
           VALUES ($1::integer, $2::integer) 
           ON CONFLICT DO NOTHING`,
          [trackId, artistId],
        );
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
  },

  findFilePathById: async function (trackId: number) {
    const pool = await dbConnection.open();

    try {
      const response = await pool.query<{ file_path: string }>(
        "SELECT file_path FROM track WHERE track_id = $1;",
        [trackId],
      );

      return response.rows.length === 0 ? null : response.rows[0].file_path;
    } catch (err) {
      logDBError("Can't get file path from db.", err);
      throw err;
    }
  },

  find: async function (searchParams: SearchParams): Promise<FoundTrack[]> {
    const pool = await dbConnection.open();

    try {
      const response = await pool.query<DBResponseFoundTrack>(
        buildSQLQuery(searchParams),
      );

      return response.rows.length === 0
        ? []
        : response.rows.map(
            ({
              artists,
              duration,
              genres,
              genre_ids,
              title,
              track_id,
              year,
              file_path,
            }) => {
              return {
                artists,
                duration: parseFloat(duration),
                genres,
                genreIds: genre_ids,
                title,
                trackId: track_id,
                year,
                filePath: file_path,
              };
            },
          );
    } catch (err) {
      logDBError("Can't find tracks", err);
      throw err;
    }
  },

  findIdsByFilePaths: async function (
    filePaths: string[],
  ): Promise<{ trackId: number; filePath: string }[]> {
    const pool = await dbConnection.open();

    try {
      const response = await pool.query<DBResponseFoundTrack>(
        `SELECT track_id, file_path FROM track WHERE file_path = ANY($1);`,
        [filePaths],
      );
      return response.rows.length === 0
        ? []
        : response.rows.map(({ track_id, file_path }) => {
            return {
              trackId: track_id,
              filePath: file_path,
            };
          });
    } catch (err) {
      logDBError("Can't find tracks", err);
      throw err;
    }
  },
};
