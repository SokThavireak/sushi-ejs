import pool from "../config/db.js";

async function run() {
  try {
    const res = await pool.query("SELECT id, status, total_price, created_at, pickup_location FROM orders ORDER BY created_at DESC");
    console.log("Total orders found:", res.rows.length);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
