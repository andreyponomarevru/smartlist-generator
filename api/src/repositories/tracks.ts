import format from "pg-format";

import { dbConnection } from "../config/postgres";
import { logDBError } from "../utils";
import { SearchParams, buildSQLQuery } from "../utils/query-builder";
import { FoundTrackDBResponse, FoundTrack, ValidatedTrack } from "../types";
import { GENRES } from "../config/constants";

export const tracksRepo = {
  create: async function (newTrack: ValidatedTrack): Promise<void> {
    const pool = await dbConnection.open();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { track_id: trackId } = (
        await client.query<{ track_id: number }>({
          text: `
            INSERT INTO track (title, year, duration, file_path) 
            VALUES ($1, $2, $3, $4) 
            RETURNING track_id`,
          values: [
            newTrack.title,
            newTrack.year,
            newTrack.duration,
            newTrack.filePath,
          ],
        })
      ).rows[0];

      for (const genreName of newTrack.genres) {
        const validGenre = GENRES.find((valid) => valid.name === genreName);
        if (!validGenre) {
          throw new Error(`'${genreName}' is not a valid genre name`);
        }

        await client.query({
          text: `
            INSERT INTO track_genre 
              (track_id, genre_id) 
            VALUES 
              ($1::integer, $2::integer) 
            ON CONFLICT DO NOTHING;`,
          values: [trackId, validGenre.id],
        });
      }

      // Insert artists

      for (const artist of newTrack.artists) {
        const { artist_id } = (
          await client.query({
            text: `
              WITH 
                input_rows (name) AS (VALUES ($1)), 
                
                ins AS ( 
                  INSERT INTO artist (name) 
                    SELECT name FROM input_rows 
                  ON CONFLICT DO NOTHING 
                  RETURNING artist_id 
                ) 
              
              SELECT artist_id FROM ins 
              
              UNION ALL 
              
              SELECT a.artist_id FROM input_rows 
              JOIN artist AS a USING (name);`,
            values: [artist],
          })
        ).rows[0];

        await client.query({
          text: `
            INSERT INTO track_artist 
              (track_id, artist_id) 
            VALUES 
              ($1::integer, $2::integer) 
            ON CONFLICT DO NOTHING`,
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
  },

  findFilePathById: async function (trackId: number) {
    const pool = await dbConnection.open();

    try {
      const getFilePath = {
        text: "SELECT file_path FROM track WHERE track_id = $1;",
        values: [trackId],
      };
      const response = await pool.query<{ file_path: string }>(getFilePath);

      return response.rows.length === 0 ? null : response.rows[0].file_path;
    } catch (err) {
      logDBError("Can't get file path from db.", err);
      throw err;
    }
  },

  find: async function (searchParams: SearchParams): Promise<FoundTrack[]> {
    const pool = await dbConnection.open();

    try {
      const sql = buildSQLQuery(searchParams);
      const response = await pool.query<FoundTrackDBResponse>(sql);

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
      const sql = `SELECT track_id, file_path FROM track WHERE file_path = ANY($1);`;
      const response = await pool.query<FoundTrackDBResponse>(sql, [filePaths]);
      console.log("RESPONSE ROWS: ", response);
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
};
