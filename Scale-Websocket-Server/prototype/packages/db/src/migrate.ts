import { pool } from './client';
import fs from 'fs';
import path from 'path';

async function migrate() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../', 'schema.sql'), 'utf-8');
    await client.query(sql);
    console.log('schema applied');
  } catch (e) {
    console.log('error occured', e);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().then(() => process.exit(0)).catch(() => process.exit(1));
