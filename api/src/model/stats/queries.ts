import { connectDB } from "../../config/postgres";
import { logDBError } from "../../utils/utilities";
import { connect } from "http2";

type CountTracksByGenreDBResponse = {
  genre_id: number;
  name: string;
  count: number;
};

type CountTracksByYearDBResponse = {
  year_id: number;
  year: number;
  count: number;
};

type CountTracksInSubplaylistsDBResponse = {
  subplaylist_id: number;
  name: string;
  count: number;
};

export async function countTracksByGenre() {
  const pool = await connectDB();

  try {
    const response = await pool.query<CountTracksByGenreDBResponse>({
      text:
        "SELECT \
          ge.genre_id, ge.name, COUNT(*)::integer \
        FROM genre AS ge \
          INNER JOIN track_genre AS tr_ge ON tr_ge.genre_id = ge.genre_id \
        GROUP BY ge.genre_id\
        ORDER BY count DESC;",
    });

    return response.rows.length === 0
      ? []
      : response.rows.map((row) => {
          return {
            id: row.genre_id,
            name: row.name,
            count: row.count,
          };
        });
  } catch (err) {
    logDBError("Can't read genre names.", err);
    throw err;
  }
}

export async function countTracksByYear() {
  const pool = await connectDB();

  try {
    const response = await pool.query<CountTracksByYearDBResponse>({
      text:
        "SELECT \
           ye.year_id, ye.year, COUNT(*)::integer \
         FROM track AS tr \
           INNER JOIN year AS ye ON ye.year_id = tr.year_id \
         GROUP BY ye.year_id \
         ORDER BY count DESC;",
    });

    return response.rows.length === 0
      ? []
      : response.rows.map((row) => {
          return {
            id: row.year_id,
            name: row.year,
            count: row.count,
          };
        });
  } catch (err) {
    logDBError("Can't read years.", err);
    throw err;
  }
}

export async function countTracksInSubplaylists() {
  const pool = await connectDB();

  try {
    const response = await pool.query<CountTracksInSubplaylistsDBResponse>({
      text:
        "SELECT\
           sub.subplaylist_id, sub.name, COUNT(*)::integer\
         FROM\
           track_subplaylist AS tr_sub\
         INNER JOIN\
           subplaylist AS sub ON tr_sub.subplaylist_id = sub.subplaylist_id\
         GROUP BY\
           sub.subplaylist_id;",
    });
    return response.rows.length === 0
      ? []
      : response.rows.map((row) => {
          return {
            id: row.subplaylist_id,
            name: row.name,
            count: row.count,
          };
        });
  } catch (err) {
    logDBError("Can't read subplaylists", err);
    throw err;
  }
}
