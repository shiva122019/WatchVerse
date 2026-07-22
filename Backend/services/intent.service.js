// services/intent.service.js

// Button taps send an explicit intent already (fast path, no detection needed).
const VALID_BUTTON_INTENTS = ["storyline", "cast", "rating", "reviews", "similar", "about"];

// Keyword patterns for free-text follow-ups.
// These are checked BEFORE ever calling Gemini, so structured
// questions never waste an LLM/grounding call.
const PATTERNS = {
  cast: /\b(cast|actor|actress|who plays|starring|played by|director|writer|creator)\b/i,
  rating: /\b(rating|score|imdb|rotten tomatoes|how good|worth watching|vote)\b/i,
  reviews: /\b(review|critic|what (do|did) people (think|say)|opinion)\b/i,
  similar: /\b(similar|like this|recommend|more (movies|shows) like|another one like)\b/i,
};

/**
 * Detects intent from a button tap (always trusted as-is)
 * or from free text (regex first, Gemini as fallback).
 *
 * @param {string|null} buttonIntent - intent explicitly sent by a button tap
 * @param {string} message - raw user text (used when no button was tapped)
 * @returns {"storyline"|"cast"|"rating"|"reviews"|"similar"|"open_question"}
 */
function detectIntent(buttonIntent, message = "") {
  if (buttonIntent && VALID_BUTTON_INTENTS.includes(buttonIntent)) {
    return buttonIntent;
  }

  for (const [intent, pattern] of Object.entries(PATTERNS)) {
    if (pattern.test(message)) return intent;
  }

  // Doesn't match any structured pattern -> treat as an open/narrative
  // question that should go to Gemini (storyline, themes, ending, etc.)
  return "open_question";
}

module.exports = { detectIntent };