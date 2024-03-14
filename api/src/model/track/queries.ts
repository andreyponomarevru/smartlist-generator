import { connectDB } from "../../config/postgres";
import { schemaCreateTrack } from "./validation-schemas";
import { TrackMetadataParser, logDBError } from "../../utils/utilities";
import { SearchParams, buildSQLQuery } from "../../utils/query-builder";
import { FoundTrackDBResponse, FoundTrack } from "../../types";

export async function create(filePath: string): Promise<void> {
  const trackMetadataParser = new TrackMetadataParser(filePath);
  const newTrack = await schemaCreateTrack.validateAsync(
    await trackMetadataParser.parseAudioFile(),
  );
  console.log(newTrack);

  const pool = await connectDB();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //
    // Insert track
    //
    const { track_id: trackId } = (
      await client.query({
        text: `\
          INSERT INTO track 
            (title, year, duration, file_path) 
          VALUES 
            ($1,    $2,   $3,       $4) 
          RETURNING track_id`,
        values: [
          newTrack.title,
          newTrack.year,
          newTrack.duration,
          newTrack.filePath,
        ],
      })
    ).rows[0];

    //
    // Insert genres
    //
    for (const genre of newTrack.genre) {
      // TODO: verify this query, I think it can be simplified
      const { genre_id } = (
        await client.query({
          text: `\
            WITH 
              input_rows (name) AS ( VALUES ($1) ), 
              ins AS ( 
                INSERT INTO genre (name) 
                  SELECT name FROM input_rows 
                ON CONFLICT DO 
                RETURNING genre_id 
              ) 
            
            SELECT genre_id FROM ins 
            
            UNION ALL 
            
            SELECT g.genre_id FROM input_rows 
            JOIN genre AS g USING (name);`,
          values: [genre],
        })
      ).rows[0];

      const inserTrackGenreQuery = {
        text: `\
          INSERT INTO track_genre 
            (track_id, genre_id) 
          VALUES 
            ($1::integer, $2::integer) 
          ON CONFLICT DO NOTHING;`,
        values: [trackId, genre_id],
      };
      await client.query(inserTrackGenreQuery);
    }

    //
    // Insert artists
    //
    for (const artist of newTrack.artist) {
      const { artist_id } = (
        await client.query({
          text: `\
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
        text: `\
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
}

export async function readFilePath(trackId: number) {
  const pool = await connectDB();

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
}

export async function findTrack(
  searchParams: SearchParams,
): Promise<FoundTrack[]> {
  const pool = await connectDB();

  try {
    const sql = buildSQLQuery(searchParams);
    const response = await pool.query<FoundTrackDBResponse>(sql);

    return response.rows.length === 0
      ? []
      : response.rows.map(
          ({
            artist,
            duration,
            genre,
            genre_id,
            title,
            track_id,
            year,
            file_path,
          }) => {
            return {
              artist,
              duration: parseFloat(duration),
              genre,
              genreId: genre_id,
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
}

export async function findTrackIdsByFilePaths(
  filePaths: string[],
): Promise<{ trackId: number; filePath: string }[]> {
  const pool = await connectDB();

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
}
