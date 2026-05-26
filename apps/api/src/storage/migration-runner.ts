import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Pool } from "pg";

const MIGRATIONS_TABLE_SQL = `
  create table if not exists schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  );
`;

export const runMigrations = async (pool: Pool, migrationsDir: string) => {
  await pool.query(MIGRATIONS_TABLE_SQL);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const version = file.replace(/\.sql$/i, "");
    const alreadyApplied = await pool.query(`select 1 from schema_migrations where version = $1 limit 1`, [version]);
    if ((alreadyApplied.rowCount ?? 0) > 0) {
      continue;
    }

    const sql = await readFile(join(migrationsDir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(`insert into schema_migrations (version) values ($1)`, [version]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
};
