const { classifyMedia } = require("./intent.service");
const deezerService = require("./Deezer.service");
const tmdbService = require("./tmdb.service");
const geminiService = require("./gemini.service");

async function handleQuery(query) {
    const type = classifyMedia(query);

    switch (type) {
        case "song": {
            const result = await deezerService.search(query);
            if (result) return geminiService.enrich(result, "song");
            return geminiService.fallback(query, "song"); // Deezer miss
        }

        case "movie":
        case "tv": {
            const result = await tmdbService.search(query, type);
            return geminiService.enrich(result, type);
        }

        case "anime": {
            // TMDB has no native "anime" type — filter by genre + origin
            const result = await tmdbService.searchAnime(query);
            return geminiService.enrich(result, "anime");
        }

        case "unknown":
        default: {
            // Let Gemini decide what this even is, then re-route
            const inferred = await geminiService.classifyIntent(query);
            return handleQuery(`${inferred.type}:${query}`); // or re-dispatch directly
        }
    }
}

module.exports = { handleQuery };