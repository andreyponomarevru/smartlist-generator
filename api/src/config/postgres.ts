import { Pool, PoolConfig } from "pg";
import {
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
} from "./env";

//
// Pg connection
//

const CONFIG: PoolConfig = {
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DATABASE,
  password: POSTGRES_PASSWORD,
  port: POSTGRES_PORT,
};

let pool: Pool | undefined;

export const dbConnection = {
  open: async function (config: PoolConfig = CONFIG) {
    if (pool) {
      return pool;
    } else {
      pool = new Pool(config);
      console.debug("New Postgres connection established");
      return pool;
    }
  },

  // Shutdown cleanly. Doc: https://node-postgres.com/api/pool#poolend
  close: async function () {
    if (pool) await pool.end();
    pool = undefined;
    console.debug("Pool has ended.");
  },
};
