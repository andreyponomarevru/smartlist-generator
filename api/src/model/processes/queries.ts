import { connectDB } from "../../config/postgres";
import { logDBError } from "../../utils/utilities";
import {
  ProcessStatus,
  Process,
  ProcessResult,
  ProcessDBResponse,
  ProcessName,
} from "../../types";

export async function create(newTask: {
  name: Process["name"];
  status: Process["status"];
}): Promise<Process> {
  const pool = await connectDB();

  try {
    const response = await pool.query<ProcessDBResponse>({
      text: `INSERT INTO process (name, status) VALUES ($1, $2) RETURNING *;`,
      values: [newTask.name, newTask.status],
    });

    return {
      name: response.rows[0].name,
      createdAt: response.rows[0].created_at,
      updatedAt: response.rows[0].updated_at,
      status: response.rows[0].status,
      result: response.rows[0].result,
    };
  } catch (err) {
    logDBError(`Can't create '${newTask.name}' process`, err);
    throw err;
  }
}

export async function read(name: ProcessName): Promise<Process | null> {
  const pool = await connectDB();

  try {
    const response = await pool.query<ProcessDBResponse>({
      text: `SELECT * FROM process WHERE name = $1;`,
      values: [name],
    });

    if (response.rows.length === 0) {
      return null;
    } else {
      return {
        name: response.rows[0].name,
        createdAt: response.rows[0].created_at,
        updatedAt: response.rows[0].updated_at,
        status: response.rows[0].status,
        result: response.rows[0].result,
      };
    }
  } catch (err) {
    logDBError(`Can't read process '${name}'`, err);
    throw err;
  }
}

export async function destroy(name: ProcessName) {
  const pool = await connectDB();

  try {
    await pool.query({
      text: `DELETE FROM process WHERE name = $1;`,
      values: [name as string],
    });
  } catch (err) {
    logDBError(`An error occured while deleting the process '${name}'`, err);
    throw err;
  }
}

export async function update(updatedTask: {
  name: ProcessName;
  status?: ProcessStatus;
  result?: ProcessResult;
}) {
  const pool = await connectDB();

  try {
    const response = await pool.query<ProcessDBResponse>({
      text: `
        UPDATE process 
        SET 
          status = COALESCE($2, status), 
          result = COALESCE($3, result),
          updated_at = CURRENT_TIMESTAMP
        WHERE name = $1
        RETURNING *;`,
      values: [updatedTask.name, updatedTask.status, updatedTask.result],
    });

    if (response.rows.length === 0) {
      return null;
    } else {
      return {
        name: response.rows[0].name,
        createdAt: response.rows[0].created_at,
        updatedAt: response.rows[0].updated_at,
        status: response.rows[0].status,
        result: response.rows[0].result,
      };
    }
  } catch (err) {
    logDBError(`Can't update process '${updatedTask.name}'`, err);
    throw err;
  }
}
