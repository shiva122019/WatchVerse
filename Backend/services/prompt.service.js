// services/prompt.service.js

function labelFor(mediaType) {
  if (mediaType === "anime") return "anime";
  if (mediaType === "tv") return "TV series";
  return "movie";
}

/**
 * System context for movie/TV/anime storyline conversations.
 */
function buildSystemContext({ title, year, mediaType }) {
  return (
    `You are a movie/TV/anime storyline assistant inside a media app called WatchVerse. ` +
    `The user is currently discussing: "${title}"${year ? ` (${year})` : ""}, ` +
    `a ${labelFor(mediaType)}. ` +
    `Provide accurate plot/storyline information about this exact title ` +
    `(don't confuse it with other titles of the same name). ` +
    `Answer directly using your knowledge. Do not use external tools or make function calls. ` +
    `Keep answers conversational, spoiler-aware (you can mention it's a spoiler but still answer if asked), ` +
    `and concise (3-6 sentences unless the user asks for more detail).`
  );
}

/**
 * System context for song/artist conversations.
 */
function buildSongSystemContext({ title, artist, album }) {
  return (
    `You are a music assistant inside a media app called WatchVerse. ` +
    `The user is currently discussing the song "${title}" by ${artist}` +
    `${album ? ` from the album "${album}"` : ""}. ` +
    `Provide accurate info: what it's about/meaning, writing/production background, ` +
    `chart performance, or context around the artist. ` +
    `Answer directly using your knowledge. Do not use external tools or make function calls. ` +
    `Never reproduce actual lyrics verbatim - describe themes and meaning in your own words instead. ` +
    `Keep answers conversational and concise (3-5 sentences unless asked for more).`
  );
}

function buildStorylinePrompt({ title, year, mediaType }) {
  return (
    `Give me the storyline/plot of "${title}"${year ? ` (${year})` : ""} ` +
    `(${labelFor(mediaType)}). Keep it engaging but accurate.`
  );
}

function buildAboutSongPrompt({ title, artist }) {
  return (
    `Tell me about the song "${title}" by ${artist} - ` +
    `what it's about, any interesting background, without quoting the lyrics directly.`
  );
}

function buildFollowUpPrompt(userMessage) {
  return userMessage;
}

module.exports = {
  buildSystemContext,
  buildSongSystemContext,
  buildStorylinePrompt,
  buildAboutSongPrompt,
  buildFollowUpPrompt,
};