import { connectDB } from "../../config/postgres";
import { logDBError } from "../../utils/utilities";

export async function countTracksByGenre(excludedTracks: number[]) {
  const pool = await connectDB();

  try {
    const response = await pool.query<{
      genre_id: number;
      name: string;
      count: number;
    }>({
      text: `
        SELECT 
          ge.genre_id, ge.name, COUNT(*)::integer
        FROM genre AS ge
          INNER JOIN track_genre AS tr_ge ON tr_ge.genre_id = ge.genre_id
        ${
          excludedTracks.length > 0
            ? "WHERE tr_ge.track_id != ALL($1::int[])"
            : ""
        }  
        GROUP BY ge.genre_id
        ORDER BY count DESC;`,
      values: excludedTracks.length > 0 ? [excludedTracks] : [],
    });

    return response.rows.length === 0
      ? []
      : response.rows.map(({ genre_id, name, count }) => {
          return {
            id: genre_id,
            name: name,
            count: count,
          };
        });
  } catch (err) {
    logDBError("Can't read genre names.", err);
    throw err;
  }
}

export async function countTracksByYear(excludedTracks: number[]) {
  const pool = await connectDB();

  console.log(
    "excludedTracks: ",
    `
  SELECT 
    year, COUNT(year)::integer 
  FROM 
    track AS tr 
  ${excludedTracks.length > 0 ? "WHERE tr.track_id != ALL($1::int[])" : ""}
  GROUP BY year 
  ORDER BY count DESC;`,
  );
  try {
    const response = await pool.query<{
      year_id: number;
      year: number;
      count: number;
    }>({
      text: `
        SELECT 
          year, COUNT(year)::integer 
        FROM 
          track AS tr 
        ${
          excludedTracks.length > 0 ? "WHERE tr.track_id != ALL($1::int[])" : ""
        }
        GROUP BY year 
        ORDER BY count DESC;`,
      values: excludedTracks.length > 0 ? [excludedTracks] : [],
    });

    return response.rows.length === 0
      ? []
      : response.rows.map(({ year, count }) => {
          return {
            name: year.toString(),
            count: count,
          };
        });
  } catch (err) {
    logDBError("Can't read years.", err);
    throw err;
  }
}
