import format from "pg-format";
import { logDBError } from "../../utils/utilities";
import { connectDB } from "../../config/postgres";
import { FoundTrackDBResponse, FoundTrack } from "../../types";

type Playlist = {
  playlist_id: number;
  name: string;
};

export async function create(title: string) {
  const pool = await connectDB();

  try {
    const response = await pool.query<Playlist>({
      text:
        "INSERT INTO playlist (name) VALUES ($1) RETURNING playlist_id, name;",
      values: [title],
    });
    return { id: response.rows[0].playlist_id, name: response.rows[0].name };
  } catch (err) {
    logDBError("Can't create a new playlist.", err);
    throw err;
  }
}

export async function read(id: number) {
  const pool = await connectDB();

  try {
    const response = await pool.query<Playlist>({
      text: "SELECT playlist_id, name FROM playlist WHERE playlist_id = $1;",
      values: [id],
    });

    // TODO ideally you should throw an error if ther db response is empty and return 404 to client
    return response.rows.length === 0
      ? null
      : { id: response.rows[0].playlist_id, name: response.rows[0].name };
  } catch (err) {
    logDBError("Can't read a playlist.", err);
    throw err;
  }
}

export async function readAll() {
  const pool = await connectDB();

  try {
    const response = await pool.query<Playlist>({
      text: "SELECT playlist_id, name FROM playlist;",
    });

    return response.rows.length === 0
      ? []
      : response.rows.map(({ playlist_id, name }) => {
          return { id: playlist_id, name };
        });
  } catch (err) {
    logDBError("Can't read all playlists.", err);
    throw err;
  }
}

export async function update({
  playlistId,
  name,
}: {
  playlistId: number;
  name: string;
}) {
  const pool = await connectDB();

  try {
    await pool.query({
      text: "UPDATE playlist SET name = $1 WHERE playlist_id = $2;",
      values: [name, playlistId],
    });
  } catch (err) {
    logDBError("Can't update playlist.", err);
    throw err;
  }
}

export async function destroy(id: number) {
  const pool = await connectDB();

  try {
    const response = await pool.query<{ playlist_id: number }>({
      text:
        "DELETE FROM playlist WHERE playlist_id = $1 RETURNING playlist_id;",
      values: [id],
    });

    return response.rows.length === 0 ? null : { playlistId: id };
  } catch (err) {
    logDBError("Can't delete playlist.", err);
    throw err;
  }
}

//

export async function removeAllTracks(playlistId: number) {
  const pool = await connectDB();

  try {
    await pool.query<{ track_id: number }>({
      text: "DELETE FROM track_playlist WHERE playlist_id = $1;",
      values: [playlistId],
    });
  } catch (err) {
    logDBError("Can't remove tracks from playlist.", err);
    throw err;
  }
}

export async function updateTracks(
  playlistId: number,
  newTracks: { trackId: number; position: number }[],
) {
  const pool = await connectDB();

  try {
    // TODO refactor in a single query
    await pool.query({
      text: "DELETE FROM track_playlist WHERE playlist_id = $1;",
      values: [playlistId],
    });

    await pool.query({
      text: format(
        `INSERT INTO track_playlist (track_id, playlist_id, position) VALUES %L;`,
        newTracks.map(({ trackId, position }) => [
          trackId,
          playlistId,
          position,
        ]),
      ),
    });
  } catch (err) {
    logDBError("Can't update tracks in playlist.", err);
    throw err;
  }
}

type TrackInPlaylistDBResponse = FoundTrackDBResponse & { position: number };
type TrackInPlaylist = FoundTrack & { position: number };

export async function readTracks(
  playlistId: number,
): Promise<TrackInPlaylist[]> {
  const pool = await connectDB();

  try {
    const response = await pool.query<TrackInPlaylistDBResponse>({
      text: `
        SELECT 
          tr.track_id, 
          tr_pl.position,
          tr.title,
          tr.duration,
          tr.year,
          array_agg(DISTINCT ar.name) AS artist,
          array_agg(DISTINCT ge.genre_id) AS genre_id,
          array_agg(DISTINCT ge.name) AS genre
        FROM track_playlist AS tr_pl
          INNER JOIN track AS tr ON tr_pl.track_id = tr.track_id
          INNER JOIN track_genre AS tr_ge ON tr_pl.track_id = tr_ge.track_id 
          INNER JOIN genre AS ge ON ge.genre_id = tr_ge.genre_id  
          INNER JOIN track_artist AS tr_ar ON tr_ar.track_id = tr_pl.track_id
          INNER JOIN artist AS ar ON ar.artist_id = tr_ar.artist_id
        WHERE tr_pl.playlist_id = $1
        GROUP BY 
          tr.track_id,
          tr.year,
          tr_pl.position;`,
      values: [playlistId],
    });

    return response.rows.length === 0
      ? []
      : response.rows.map(
          ({
            artist,
            duration,
            genre,
            genre_id,
            position,
            title,
            track_id,
            year,
            file_path,
          }) => {
            return {
              artist: artist,
              duration: parseFloat(duration),
              genre: genre,
              genreId: genre_id,
              position,
              title: title,
              trackId: track_id,
              year: year,
              filePath: file_path,
            };
          },
        );
  } catch (err) {
    logDBError("Can't delete playlist.", err);
    throw err;
  }
}
