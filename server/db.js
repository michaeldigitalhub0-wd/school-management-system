const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbFile);

// initialize tables if not exist
db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    phone TEXT,
    class TEXT,
    subject TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT,
    action TEXT,
    time TEXT
  )`);
});

module.exports = db;
