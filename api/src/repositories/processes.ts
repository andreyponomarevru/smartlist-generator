import { dbConnection } from "../config/postgres";
import { logDBError } from "../utils";
import {
  ProcessStatus,
  Process,
  ProcessResult,
  ProcessDBResponse,
  ProcessName,
} from "../types";

export const processesRepo = {
  create: async function (newTask: {
    name: Process["name"];
    status: Process["status"];
  }): Promise<Process> {
    const pool = await dbConnection.open();

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
  },

  read: async function (name: ProcessName): Promise<Process | null> {
    const pool = await dbConnection.open();

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
  },

  destroy: async function (name: ProcessName) {
    const pool = await dbConnection.open();

    try {
      await pool.query({
        text: `DELETE FROM process WHERE name = $1;`,
        values: [name as string],
      });
    } catch (err) {
      logDBError(`An error occured while deleting the process '${name}'`, err);
      throw err;
    }
  },

  update: async function (updatedTask: {
    name: ProcessName;
    status?: ProcessStatus;
    result?: ProcessResult;
  }) {
    const pool = await dbConnection.open();

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
  },
};
