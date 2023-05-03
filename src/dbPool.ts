import { Pool, QueryResult } from 'pg';

const { DB_PASSWORD, DB_NAME, DB_USERNAME, DB_PORT, DB_HOST } = process.env;

const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
});

export const poolQuery = async (action: string, values?: any[]) => {
  let result: QueryResult;

  try {
    result = await pool.query(action, values);
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};