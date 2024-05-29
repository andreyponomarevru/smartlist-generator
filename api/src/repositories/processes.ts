import { dbConnection } from "../config/postgres";
import { logDBError } from "../utils";
import {
  OSProcessStatus,
  SSEMessage,
  ValidationResult,
  ProcessDBResponse,
  OSProcessName,
} from "../types";

export const processesRepo = {
  create: async function (newTask: {
    name: SSEMessage["name"];
    status: SSEMessage["status"];
  }): Promise<SSEMessage> {
    const pool = await dbConnection.open();

    try {
      const response = await pool.query<ProcessDBResponse>(
        `INSERT INTO process (name, status) VALUES ($1, $2) RETURNING *;`,
        [newTask.name, newTask.status],
      );
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

  read: async function (name: OSProcessName): Promise<SSEMessage | null> {
    const pool = await dbConnection.open();

    try {
      const response = await pool.query<ProcessDBResponse>(
        `SELECT * FROM process WHERE name = $1;`,
        [name],
      );

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

  destroy: async function (name: OSProcessName) {
    const pool = await dbConnection.open();

    try {
      await pool.query(`DELETE FROM process WHERE name = $1;`, [name]);
    } catch (err) {
      logDBError(`An error occured while deleting the process '${name}'`, err);
      throw err;
    }
  },

  update: async function (updatedTask: {
    name: OSProcessName;
    status?: OSProcessStatus;
    result?: ValidationResult;
  }): Promise<SSEMessage | null> {
    const pool = await dbConnection.open();

    try {
      const response = await pool.query<ProcessDBResponse>(
        `UPDATE process 
         SET 
           status = COALESCE($2, status), 
           result = COALESCE($3, result),
           updated_at = CURRENT_TIMESTAMP
         WHERE name = $1
         RETURNING *;`,
        [updatedTask.name, updatedTask.status, updatedTask.result],
      );

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
