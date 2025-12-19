const path = require('path');
const fs = require('fs');
// Use sql.js (WASM) to avoid native compilation on Windows
const initSqlJs = require('sql.js');

function exitWith(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  exitWith('Environment variable DATABASE_URL is not set. Set it before running migrate.');
}

// Ensure migrations file exists
const migrationsPath = path.join(__dirname, 'migrations', 'init.sql');
if (!fs.existsSync(migrationsPath)) {
  exitWith(`Migration file not found: ${migrationsPath}`);
}

(
  async () => {
    const sql = fs.readFileSync(migrationsPath, 'utf8');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const dbFile = path.join(dataDir, 'app.db');

    try {
      console.log('Initializing sql.js (WASM)...');
      // Ensure the wasm file is resolved from node_modules/sql.js/dist
      const locate = (file) => {
        return path.join(__dirname, 'node_modules', 'sql.js', 'dist', file);
      };
      const SQL = await initSqlJs({ locateFile: locate });
      const db = new SQL.Database();
      console.log('Running migrations into in-memory database...');
      db.run(sql);

      // Export to SQLite binary and write to file
      const binary = db.export();
      const buffer = Buffer.from(binary);
      fs.writeFileSync(dbFile, buffer);
      db.close();

      console.log('Migrations completed successfully. DB written to', dbFile);
      process.exit(0);
    } catch (err) {
      console.error('Failed to run migrations:', err.message || err);
      process.exit(1);
    }
  }
)();
