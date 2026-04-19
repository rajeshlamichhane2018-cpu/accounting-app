import { getDB } from "./lib/db.js";

async function init() {
  const db = await getDB();

  // ✅ transactions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      account TEXT,
      type TEXT,
      amount REAL,
      description TEXT
    )
  `);

  // ✅ accounts table (FIXED)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT
    )
  `);

  console.log("Database ready ✅");
}

init();