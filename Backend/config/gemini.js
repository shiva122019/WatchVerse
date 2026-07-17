// config/gemini.js
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY is missing in .env");
} else {
  // TEMP DEBUG: confirm which key is actually loaded, without printing the full secret
  console.log(`🔑 Gemini key loaded: ...${GEMINI_API_KEY.slice(-6)} | model: ${GEMINI_MODEL}`);
}

module.exports = {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  GEMINI_BASE_URL,
  getEndpoint: () =>
    `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
};