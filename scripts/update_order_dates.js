import pool from "../config/db.js";

async function run() {
  try {
    console.log("Updating order created_at dates to be relative to current date...");
    await pool.query("UPDATE orders SET created_at = NOW() - INTERVAL '6 days' WHERE id = 1");
    await pool.query("UPDATE orders SET created_at = NOW() - INTERVAL '4 days' WHERE id = 2");
    await pool.query("UPDATE orders SET created_at = NOW() - INTERVAL '3 days' WHERE id = 3");
    await pool.query("UPDATE orders SET created_at = NOW() - INTERVAL '2 days' WHERE id = 4");
    await pool.query("UPDATE orders SET created_at = NOW() - INTERVAL '1 day' WHERE id = 5");
    await pool.query("UPDATE orders SET created_at = NOW() WHERE id = 6");
    console.log("✅ Order dates updated successfully!");
  } catch (err) {
    console.error("❌ Error updating order dates:", err);
  } finally {
    await pool.end();
  }
}

run();
