import { Pool, type QueryResultRow } from 'pg';

console.log(process.env.DATABASE_URL)

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends QueryResultRow>(text: string, params?: unknown[]) {
  const res = await pool.query<T>(text, params);
  return res;
}

export async function getClient() {
  return pool.connect();
}
