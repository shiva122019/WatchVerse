const router = require("express").Router();
const tmdb = require("../lib/tmdb");
const {
  spotifySearchTracks,
  spotifySearchTracksBatch,
  searchTrack,
} = require("../services/spotify.service");
const { spotifySearchTrack, musicCache } = require("../lib/spotify");
const {
  homeCache,
  browseCache,
  genreCache,
  mapTMDBItem,
  tmdbFetch,
  getRecommendedForUser,
  getBecauseYouWatched,
  getTVShows,
  getGenreRows,
  getUpcoming,
  getGenreContent,
  getTrending,
  getContinueWatching,
} = require("../services/home.service");

router.get("/", async (req, res) => {
  try {
    let publicSections = homeCache.get("homepage");

    if (!publicSections) {
      const [trending, upcoming, genreRows, tvShows] = await Promise.all([
        getTrending(),
        getUpcoming(),
        getGenreRows(),
        getTVShows(),
      ]);

      publicSections = {
        trending,
        upcoming,
        genreRows,
        tvShows,
      };

      homeCache.set("homepage", publicSections);
    }

    let continueWatching = [];
    let recommended = [];
    let becauseYouWatched = {
      source: null,
      items: [],
    };

    if (req.user) {
      [continueWatching, recommended, becauseYouWatched] = await Promise.all([
        getContinueWatching(req.user._id),
        getRecommendedForUser(req.user._id),
        getBecauseYouWatched(req.user._id),
      ]);
    }

    return res.json({
      ...publicSections,
      continueWatching,
      recommended,
      becauseYouWatched,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to load homepage.",
    });
  }
});

router.get("/section", async (req, res) => {
  try {
    const { section, page = 1 } = req.query;

    const pageNum = Math.max(1, Number(page));

    const SECTION_HANDLERS = {
      trending: () => getTrending(pageNum),

      upcoming: () => getUpcoming(pageNum),

      tv: () => getTVShows(pageNum),

      action: () => getGenreContent("Action", pageNum),

      comedy: () => getGenreContent("Comedy", pageNum),

      drama: () => getGenreContent("Drama", pageNum),

      "science-fiction": () => getGenreContent("Science Fiction", pageNum),

      horror: () => getGenreContent("Horror", pageNum),

      romance: () => getGenreContent("Romance", pageNum),

      recommended: () => {
        if (!req.user) return [];
        return getRecommendedForUser(req.user._id, pageNum);
      },

      continueWatching: () => {
        if (!req.user) return [];
        return getContinueWatching(req.user._id, pageNum);
      },

      becauseYouWatched: async () => {
        if (!req.user) return [];

        const result = await getBecauseYouWatched(req.user._id, pageNum);

        return result.items;
      },
    };

    const handler = SECTION_HANDLERS[section];

    if (!handler) {
      return res.status(400).json({
        success: false,
        message: "Invalid section.",
      });
    }

    const items = await handler();

    return res.json(items);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to load section.",
    });
  }
});

router.get("/queryContent", async (req, res) => {
  try {
    const { type = "", genre = "", q = "", limit = 100 } = req.query;
    const page = parseInt(req.query.page) || 1;

    //--------------------------------------------------
    // Music (Spotify)
    //--------------------------------------------------

    if (type === "song") {
      try {
        const pageNum = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Number(limit) || 20;

        const cacheKey = `song-${q || genre || "default"}`;
        let results = musicCache.get(cacheKey);

        if (!results) {
          if (q) {
            results = await spotifySearchTracks(q, 10, 0);
          } else if (genre) {
            results = await spotifySearchTracks(
              `genre:"${genre.toLowerCase()}"`,
              10,
              0,
            );
          } else {
            results = await spotifySearchTracks("a", 10, 0);
          }

          musicCache.set(cacheKey, results);
        }

        const start = (pageNum - 1) * pageSize;
        const end = start + pageSize;

        return res.json(results.slice(start, end));
      } catch (err) {
        console.error("🔴 SPOTIFY ERROR MESSAGE:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch music.",
        });
      }
    }

    //--------------------------------------------------
    // Determine media types
    //--------------------------------------------------

    const mediaTypes = [];

    if (!type) {
      mediaTypes.push("movie", "tv");
    } else if (type === "movie") {
      mediaTypes.push("movie");
    } else if (type === "series") {
      mediaTypes.push("tv");
    }

    //--------------------------------------------------
    // Load genre maps (24-hour cache)
    //--------------------------------------------------

    const genreMaps = {};

    for (const mediaType of mediaTypes) {
      const cacheKey = `genres-${mediaType}`;

      let genreMap = genreCache.get(cacheKey);

      if (!genreMap) {
        const data = await tmdbFetch(`/genre/${mediaType}/list`);

        genreMap = {};

        data.genres.forEach((g) => {
          genreMap[g.id] = g.name;
        });

        genreCache.set(cacheKey, genreMap);
      }

      genreMaps[mediaType] = genreMap;
    }

    let results = [];

    //--------------------------------------------------
    // Search / Discover / Trending
    //--------------------------------------------------

    for (const mediaType of mediaTypes) {
      const genreMap = genreMaps[mediaType];

      let genreId = "";

      if (genre) {
        const entry = Object.entries(genreMap).find(
          ([, name]) => name.toLowerCase() === genre.toLowerCase(),
        );

        if (entry) {
          genreId = entry[0];
        }
      }

      let data;

      //----------------------------------------------
      // Search (no cache)
      //----------------------------------------------

      if (q) {
        data = await tmdbFetch(`/search/${mediaType}`, {
          params: {
            query: q,
            page,
          },
        });
      }

      //----------------------------------------------
      // Discover (15-minute cache)
      //----------------------------------------------
      else if (genreId) {
        const cacheKey = `discover-${mediaType}-${genreId}-${page}`;

        data = browseCache.get(cacheKey);

        if (!data) {
          data = await tmdbFetch(`/discover/${mediaType}`, {
            params: {
              with_genres: genreId,
              page,
            },
          });

          browseCache.set(cacheKey, data);
        }
      }

      //----------------------------------------------
      // Trending (15-minute cache)
      //----------------------------------------------
      else {
        const cacheKey = `trending-${mediaType}-${page}`;

        data = browseCache.get(cacheKey);

        if (!data) {
          data = await tmdbFetch(`/trending/${mediaType}/week`, {
            params: {
              page,
            },
          });

          browseCache.set(cacheKey, data);
        }
      }

      let mapped = (data.results || []).map((item) =>
        mapTMDBItem(item, mediaType, genreMap),
      );

      if (q && genre) {
        mapped = mapped.filter((item) =>
          item.genres.some((g) => g.toLowerCase() === genre.toLowerCase()),
        );
      }

      results.push(...mapped);
    }

    //--------------------------------------------------
    // Person search
    //--------------------------------------------------

    if (q) {
      const personData = await tmdbFetch("/search/person", {
        params: {
          query: q,
          page,
        },
      });

      const people = (personData.results || []).slice(0, 5);

      for (const person of people) {
        const creditsData = await tmdbFetch(
          `/person/${person.id}/combined_credits`,
        );

        for (const credit of creditsData.cast || []) {
          if (credit.media_type !== "movie" && credit.media_type !== "tv") {
            continue;
          }

          if (
            type &&
            ((type === "movie" && credit.media_type !== "movie") ||
              (type === "series" && credit.media_type !== "tv"))
          ) {
            continue;
          }

          const genreMap =
            genreMaps[credit.media_type === "movie" ? "movie" : "tv"];

          const mapped = mapTMDBItem(credit, credit.media_type, genreMap);

          if (
            genre &&
            !mapped.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
          ) {
            continue;
          }

          results.push(mapped);
        }
      }
    }

    //--------------------------------------------------
    // Remove duplicates
    //--------------------------------------------------

    const seen = new Set();

    results = results.filter((item) => {
      const key = `${item.type}-${item.id}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });

    //--------------------------------------------------
    // Sort by rating
    //--------------------------------------------------

    results.sort((a, b) => b.avg_rating - a.avg_rating);

    res.json(results.slice(0, Number(limit)));
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch content.",
    });
  }
});

module.exports = router;
