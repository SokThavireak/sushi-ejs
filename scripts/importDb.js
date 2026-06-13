import fs from "fs";
import path from "path";
import pool from "../config/db.js";

const __dirname = path.resolve();

async function runSqlFile(filePath) {
  console.log(`Reading SQL file: ${path.basename(filePath)}...`);
  const sql = fs.readFileSync(filePath, "utf8");
  try {
    console.log(`Executing SQL queries...`);
    await pool.query(sql);
    console.log(`✅ Completed executing ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`❌ Error executing ${path.basename(filePath)}:`, err.message);
  }
}

async function createSessionTable() {
  const sessionSql = `
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    ) WITH (OIDS=FALSE);
    
    ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    
    DROP INDEX IF EXISTS "IDX_session_expire";
    CREATE INDEX "IDX_session_expire" ON "session" ("expire");
  `;
  try {
    console.log(`Creating session table...`);
    await pool.query(sessionSql);
    console.log(`✅ Session table ready!`);
  } catch (err) {
    console.error(`❌ Error creating session table:`, err.message);
  }
}

(async () => {
  try {
    // If sushi.sql exists, import it
    const sushiSqlPath = path.join(__dirname, "database", "sushi.sql");
    if (fs.existsSync(sushiSqlPath)) {
      await runSqlFile(sushiSqlPath);
    }

    // If backup exists, import it
    const backupSqlPath = path.join(__dirname, "database", "opulent_pos_backup.sql");
    if (fs.existsSync(backupSqlPath)) {
      await runSqlFile(backupSqlPath);
    }

    // Create session table
    await createSessionTable();

    console.log("🎉 Database initialization completed successfully!");
  } catch (err) {
    console.error("Critical error during database import:", err);
  } finally {
    await pool.end();
  }
})();
