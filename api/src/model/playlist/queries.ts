import { logDBError } from "../../utils/utilities";
import { connectDB } from "../../config/postgres";

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

    return response.rows.length > 0 ? { playlistId: id } : null;
  } catch (err) {
    logDBError("Can't delete playlist.", err);
    throw err;
  }
}
