/**
 * Admin Seeder Script
 * ───────────────────
 * Promotes the user with email admin@gmail.com to role:"admin".
 *
 * Prerequisites:
 *   1. The admin@gmail.com account must already exist (register via /auth/register).
 *   2. MONGO_URL must be set in Backend/.env
 *
 * Usage (from the Backend/ directory):
 *   node scripts/seed-admin.js
 *
 * This script is idempotent — safe to run multiple times.
 */

require("dotenv").config();
const mongoose = require("mongoose");

const ADMIN_EMAIL = "admin@gmail.com";

async function seedAdmin() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error("❌  MONGO_URL is not set. Check your .env file.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB…");
  await mongoose.connect(mongoUrl);

  // Dynamically load model AFTER mongoose is connected
  const User = require("../Models/User");

  const user = await User.findOne({ email: ADMIN_EMAIL });
  if (!user) {
    console.error(
      `❌  No user found with email "${ADMIN_EMAIL}".`,
    );
    console.error(
      "   Register that account via the normal /auth/register flow first,",
    );
    console.error("   then run this script again.");
    await mongoose.disconnect();
    process.exit(1);
  }

  if (user.role === "admin") {
    console.log(
      `✅  "${ADMIN_EMAIL}" already has role "admin". Nothing to do.`,
    );
    await mongoose.disconnect();
    process.exit(0);
  }

  user.role = "admin";
  await user.save();

  console.log(`  "${ADMIN_EMAIL}" promoted to role "admin" successfully.`);
  console.log(`   User ID : ${user._id}`);
  console.log(`   Username: ${user.username}`);

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌  Seed script failed:", err.message);
  process.exit(1);
});
