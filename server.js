import "dotenv/config";
import app from "./src/app.js";
import pool from "./src/config/db.js";
import { ensureDatabase, ensureSchema } from "./src/config/initDb.js";
import { ensureAdminUser } from "./src/config/seedAdmin.js";
import { ensureAboutProfile } from "./src/config/seedAboutProfile.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await ensureDatabase();
    await ensureSchema();
    await ensureAdminUser();
    await ensureAboutProfile();

    const connection = await pool.getConnection();
    connection.release();
    console.log("Connected to MySQL database.");
  } catch (err) {
    console.error("Failed to connect to MySQL database:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
