import { connectDB } from "../../config/postgres";
import { logDBError } from "../../utils/utilities";
import {
  TaskStatus,
  Task,
  TaskResult,
  TaskDBResponse,
  TaskName,
} from "../../types";

export async function create(newTask: {
  name: Task["name"];
  status: Task["status"];
}): Promise<Task> {
  const pool = await connectDB();

  try {
    const response = await pool.query<TaskDBResponse>({
      text: `INSERT INTO task (name, status) VALUES ($1, $2) RETURNING *;`,
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
    logDBError(`Can't create '${newTask.name}' task`, err);
    throw err;
  }
}

export async function read(name: TaskName): Promise<Task | null> {
  const pool = await connectDB();

  try {
    const response = await pool.query<TaskDBResponse>({
      text: `SELECT * FROM task WHERE name = $1;`,
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
    logDBError(`Can't read task '${name}'`, err);
    throw err;
  }
}

export async function destroy(name: TaskName) {
  const pool = await connectDB();

  try {
    await pool.query({
      text: `DELETE FROM task WHERE name = $1;`,
      values: [name as string],
    });
  } catch (err) {
    logDBError(`An error occured while deleting the task '${name}'`, err);
    throw err;
  }
}

export async function update(updatedTask: {
  name: TaskName;
  status?: TaskStatus;
  result?: TaskResult;
}) {
  const pool = await connectDB();

  try {
    await pool.query<never>({
      text: `
        UPDATE task 
        SET 
          status = COALESCE($2, status), 
          result = COALESCE($2, result),
          updated_at = DEFAULT
        WHERE name = $1;`,
      values: [updatedTask.name, updatedTask.status, updatedTask.result],
    });
  } catch (err) {
    logDBError(`Can't update task '${updatedTask.name}'`, err);
    throw err;
  }
}
