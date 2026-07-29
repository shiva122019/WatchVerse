// config/gemini.js

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// ✅ FIX: Update default to the latest stable model (gemini-3.6-flash)
// gemini-2.5-flash retires Oct 16, 2026.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY is missing in .env");
} else {
  // Secure debug log
  console.log(
    `🔑 Gemini key loaded: ...${GEMINI_API_KEY.slice(-6)} | model: ${GEMINI_MODEL}`,
  );
}

module.exports = {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  GEMINI_BASE_URL,
  getEndpoint: (modelId = GEMINI_MODEL) =>
    `${GEMINI_BASE_URL}/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
};
