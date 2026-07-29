// services/gemini.service.js
const axios = require("axios");
const rax = require("retry-axios");
const { getEndpoint, GEMINI_MODEL } = require("../config/gemini");

const geminiClient = axios.create({
  timeout: 30000,
});

// Attach retry-axios to this instance, then configure it via defaults.
// Setting instance here (after attach) so rax uses geminiClient for retries,
// not the global axios instance.
rax.attach(geminiClient);
geminiClient.defaults.raxConfig = {
  instance: geminiClient,
  retry: 2,
  // Exponential back-off for rate-limit windows: ~100ms, ~200ms
  retryDelay: 100,
  backoffType: "exponential",
  httpMethodsToRetry: ["POST"],
  // Only retry on Gemini-specific transient errors
  statusCodesToRetry: [
    [429, 429],
    [503, 503],
  ],
  onRetryAttempt: (err) => {
    const cfg = rax.getConfig(err);
    const status = err.response?.status;
    console.warn(
      `[Gemini] Retry attempt #${cfg.currentRetryAttempt} – HTTP ${status ?? err.code}`,
    );
  },
};

async function askGemini(history, systemContext) {
  let normalizedHistory = history;
  if (typeof history === "string") {
    normalizedHistory = [{ role: "user", text: history }];
  } else if (!Array.isArray(history)) {
    throw new TypeError("History must be a string or an array of message objects");
  }

  // 1. Map history correctly
  const contents = normalizedHistory.map((h) => ({
    role: h.role === "assistant" ? "model" : "user",
    parts: [{ text: h.text }],
  }));

  // 2. Use the configured GEMINI_MODEL or fallback to gemini-3.6-flash
  const modelId = GEMINI_MODEL || "gemini-3.6-flash";

  const url = getEndpoint(modelId);

  // DEBUG: Log actual values
  console.log("🔍 Debug Info:");
  console.log("URL:", url);
  console.log("Model:", modelId);
  console.log(
    "API Key Present:",
    !!geminiClient.defaults?.headers?.Authorization ||
      !!process.env.GEMINI_API_KEY,
  );

  // 3. FIX: Log the ACTUAL payload structure for debugging
  const payload = {
    contents,
    systemInstruction: systemContext
      ? { parts: [{ text: systemContext }] }
      : undefined,
    generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
  };
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    // 4. FIX: Remove the invalid "gemini - 3 - flash" line. Use the defined modelId.
    const { data } = await geminiClient.post(url, payload);

    const candidate = data.candidates?.[0];
    const textParts = (candidate?.content?.parts || [])
      .map((p) => p.text)
      .filter(Boolean);

    if (textParts.length === 0) {
      console.warn(
        "Gemini returned no text. finishReason:",
        candidate?.finishReason,
      );
    }

    const text =
      textParts.join("\n") || "Sorry, I couldn't find anything on that.";
    return { text, sources: [] };
  } catch (err) {
    const status = err.response?.status;
    console.log("Status:", status);
    console.log("Response:", JSON.stringify(err.response?.data, null, 2));

    const message =
      status === 429
        ? "Gemini rate limit reached. Please try again shortly."
        : status === 404
          ? `Model '${modelId}' not found. It may be retired.`
          : status === 503
            ? "Gemini is temporarily overloaded. Please try again in a moment."
            : "Something went wrong answering that.";

    const wrapped = new Error(message);
    wrapped.isRateLimit = status === 429;
    throw wrapped;
  }
}

module.exports = { askGemini };
