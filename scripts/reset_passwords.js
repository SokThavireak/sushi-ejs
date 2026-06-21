import pool from "../config/db.js";

const newHash = "$2b$10$SA2DPCyPzH9z2vGxdTfW2Ow53B8ftig8SlJ.Fwq4y4vKCSaRf9EQS"; // bcrypt hash of "1"
const usersToReset = [
  "account@gmail.com",
  "local1@gmail.com",
  "local2@gmail.com",
  "staff1@gmail.com",
  "staff2@gmail.com",
  "cashier1@gmail.com",
  "vireak@gmail.com"
];

async function resetPasswords() {
  try {
    console.log("Resetting passwords in database...");
    for (const email of usersToReset) {
      const res = await pool.query(
        "UPDATE users SET password = $1 WHERE email = $2 RETURNING email, role",
        [newHash, email]
      );
      if (res.rowCount > 0) {
        console.log(`✅ Reset password for ${email} (role: ${res.rows[0].role})`);
      } else {
        console.warn(`⚠️ User ${email} not found in database`);
      }
    }
    console.log("🎉 All passwords reset successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error resetting passwords:", err);
    process.exit(1);
  }
}

resetPasswords();
