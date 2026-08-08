const router = require("express").Router();
const tmdb = require("../lib/tmdb");
const {
  spotifySearchTracks,
  spotifySearchTracksBatchMeta,
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
    const page = parseInt(req.query.page) || 1;
    const [movieGenresRes, tvGenresRes] = await Promise.all([
      tmdb.get("/genre/movie/list"),
      tmdb.get("/genre/tv/list"),
    ]);

    const movieGenreMap = {};
    const tvGenreMap = {};

    movieGenresRes.data.genres.forEach((g) => {
      movieGenreMap[g.id] = g.name;
    });

    tvGenresRes.data.genres.forEach((g) => {
      tvGenreMap[g.id] = g.name;
    });
    if (page > 1) {
      // Fetch trending page
      const cacheKey = `homepage-trending-${page}`;
      let data = browseCache.get(cacheKey);
      if (!data) {
        data = await tmdbFetch("/trending/all/week", {
          params: { page },
        });
        browseCache.set(cacheKey, data);
      }

      const results = (data.results || [])
        .filter(
          (item) => item.media_type === "movie" || item.media_type === "tv",
        )
        .map((item) =>
          mapTMDBItem(
            item,
            item.media_type,
            item.media_type === "movie" ? movieGenreMap : tvGenreMap,
          ),
        );

      return res.json(results);
    }

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
    console.error("TMDB API Error, falling back to mock data:", err);

    return res.json({
      trending: [
        { id: 1, title: "Dune: Part Two", type: "movie", poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqqUTc5.jpg", rating: 8.5, genres: ["Sci-Fi", "Adventure"] },
        { id: 2, title: "Oppenheimer", type: "movie", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", rating: 8.1, genres: ["Drama", "History"] },
        { id: 3, title: "Shogun", type: "series", poster: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1Wf8MCWwG0.jpg", rating: 8.7, genres: ["Drama"] },
      ],
      upcoming: [],
      genreRows: [{ title: "Popular Right Now", items: [ { id: 4, title: "Deadpool & Wolverine", type: "movie", poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", rating: 7.9, genres: ["Action"] } ] }],
      tvShows: [],
      continueWatching: [],
      recommended: [],
      becauseYouWatched: { source: null, items: [] }
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
        const start = (pageNum - 1) * pageSize;
        const end = start + pageSize;

        const cacheKey = `song-${q || genre || "default"}`;
        const cached = musicCache.get(cacheKey) || {
          tracks: [],
          exhausted: false,
        };
        let { tracks, exhausted } = cached;

        // Only hit Spotify for more if we don't have enough cached
        // and there's more to fetch.
        if (tracks.length < end && !exhausted) {
          const searchQuery = q
            ? q
            : genre
              ? `genre:"${genre.toLowerCase()}"`
              : "a";

          const needed = end - tracks.length;
          const { tracks: more, exhausted: nowExhausted } =
            await spotifySearchTracksBatchMeta(
              searchQuery,
              needed,
              tracks.length,
            );

          tracks = tracks.concat(more);
          exhausted = nowExhausted;

          musicCache.set(cacheKey, { tracks, exhausted });
        }

        const pageResults = tracks.slice(start, end);
        const hasMore =
          end < tracks.length ||
          (!exhausted && pageResults.length === pageSize);

        return res.json({
          results: pageResults,
          page: pageNum,
          hasMore,
        });
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