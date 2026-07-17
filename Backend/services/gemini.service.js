// services/gemini.service.js
const axios = require("axios");
const { getEndpoint } = require("../config/gemini");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askGemini(history, systemContext, attempt = 0) {
  const contents = history.map((h) => ({
    role: h.role === "assistant" ? "model" : "user",
    parts: [{ text: h.text }],
  }));

  try {
    const { data } = await axios.post(getEndpoint(), {
      contents,
      systemInstruction: { parts: [{ text: systemContext }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
    });

    const candidate = data.candidates?.[0];
    const textParts = (candidate?.content?.parts || []).map((p) => p.text).filter(Boolean);

    if (textParts.length === 0) {
      console.warn("Gemini returned no text. finishReason:", candidate?.finishReason);
    }

    const text = textParts.join("\n") || "Sorry, I couldn't find anything on that.";
    return { text, sources: [] }; // no grounding = no sources, that's fine
    } catch (err) {
  console.log("Status:", err.response?.status);
  console.log("Headers:", err.response?.headers);
  console.log(
    "Response:",
    JSON.stringify(err.response?.data, null, 2)
  );

  throw err;
}

    if ((status === 429 || status === 503) && attempt < 2) {
      const waitMs = status === 503 ? 1000 * (attempt + 1) : 15000;
      console.warn(`Gemini ${status} - retrying in ${waitMs}ms`);
      await sleep(waitMs);
      return askGemini(history, systemContext, attempt + 1);
    }

    const message =
      status === 429
        ? "Gemini rate limit reached. Please try again shortly."
        : status === 503
          ? "Gemini is temporarily overloaded. Please try again in a moment."
          : "Something went wrong answering that.";

    const wrapped = new Error(message);
    wrapped.isRateLimit = status === 429;
    throw wrapped;
  }

module.exports = { askGemini };