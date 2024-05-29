import { beforeAll, describe, expect, it } from "@jest/globals";
import { Pool } from "pg";

import { dbConnection } from "../../src/config/postgres";
import { processesRepo } from "../../src/repositories";

let pool: Pool;

beforeAll(async () => (pool = await dbConnection.open()));

describe("processesRepo", () => {
  describe("create", () => {
    it("creates a new process record for a task", async () => {
      const name = "validation";
      const status = "pending";
      const taskResult = null;

      const result = await processesRepo.create({ name, status });
      const response = await pool.query("SELECT * FROM process;");

      expect(result).toStrictEqual({
        name,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        status,
        result: taskResult,
      });
      expect(response.rowCount).toBe(1);
      expect(response.rows[0]).toStrictEqual({
        name,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        status,
        result: taskResult,
      });
    });

    it("throws an error on unsupported process name", async () => {
      const result = async () =>
        await pool.query(
          `INSERT INTO process (name, status) 
           VALUES ('unsupported process name', 'pending');`,
        );

      await expect(result).rejects.toThrow();
    });

    it("accepts process name 'validation'", async () => {
      await expect(
        pool.query(
          `INSERT INTO process (name, status) 
           VALUES ('validation', 'pending');`,
        ),
      ).resolves.not.toThrow();
    });

    it("accepts process name 'seeding'", async () => {
      await expect(
        pool.query(
          `INSERT INTO process (name, status) 
           VALUES ('seeding', 'pending');`,
        ),
      ).resolves.not.toThrow();
    });

    it("throws an error on unsupported process status", async () => {
      const result = async () =>
        await pool.query(
          `INSERT INTO process (name, status) 
           VALUES ('validation', 'unsupported status');`,
        );

      await expect(result).rejects.toThrow();
    });

    it("accepts process status 'pending'", async () => {
      await expect(
        pool.query(
          `INSERT INTO process (name, status) 
           VALUES ('validation', 'pending');`,
        ),
      ).resolves.not.toThrow();
    });

    it("accepts process status 'failure'", async () => {
      await expect(
        pool.query(
          `INSERT INTO process (name, status) 
           VALUES ('validation', 'failure');`,
        ),
      ).resolves.not.toThrow();
    });

    it("accepts process status 'success'", async () => {
      await expect(
        pool.query(
          `INSERT INTO process (name, status) 
           VALUES ('validation', 'success');`,
        ),
      ).resolves.not.toThrow();
    });
  });

  describe("read", () => {
    it("returns process by name", async () => {
      await pool.query(
        `INSERT INTO process (name, status) 
         VALUES ('validation', 'pending');`,
      );

      const result = await processesRepo.read("validation");

      expect(result).toStrictEqual({
        name: "validation",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        status: "pending",
        result: null,
      });
    });
  });

  describe("destroy", () => {
    it("deletes the process by name", async () => {
      await pool.query(
        `INSERT INTO process (name, status) 
         VALUES ('validation', 'pending');`,
      );

      await processesRepo.destroy("validation");

      const response = await pool.query(`SELECT * FROM process;`);
      expect(response.rows).toStrictEqual([]);
    });
  });

  describe("update", () => {
    it("updates the process by name", async () => {
      const processResult = {
        errors: [],
        artists: { names: [], count: 0 },
        years: { names: [], count: 0 },
        genres: { names: [], count: 0 },
      };
      await pool.query(
        `INSERT INTO process (name, status,result) 
         VALUES ('validation', 'pending', $1);`,
        [processResult],
      );

      const result = await processesRepo.update({
        name: "validation",
        status: "success",
        result: processResult,
      });

      expect(result).toStrictEqual({
        name: "validation",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        status: "success",
        result: processResult,
      });
    });
  });
});
