// const router = require("express").Router();
// const tmdb = require("../lib/tmdb");
// const {
//   spotifySearchTracks,
//   spotifySearchTracksBatchMeta,
//   searchTrack,
// } = require("../services/spotify.service");
// const { spotifySearchTrack, musicCache } = require("../lib/spotify");
// const {
//   homeCache,
//   browseCache,
//   genreCache,
//   mapTMDBItem,
//   tmdbFetch,
//   getRecommendedForUser,
//   getBecauseYouWatched,
//   getTVShows,
//   getGenreRows,
//   getUpcoming,
//   getGenreContent,
//   getTrending,
//   getContinueWatching,
// } = require("../services/home.service");

// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const [movieGenresRes, tvGenresRes] = await Promise.all([
//       tmdb.get("/genre/movie/list"),
//       tmdb.get("/genre/tv/list"),
//     ]);

//     const movieGenreMap = {};
//     const tvGenreMap = {};

//     movieGenresRes.data.genres.forEach((g) => {
//       movieGenreMap[g.id] = g.name;
//     });

//     tvGenresRes.data.genres.forEach((g) => {
//       tvGenreMap[g.id] = g.name;
//     });
//     if (page > 1) {
//       // Fetch trending page
//       const cacheKey = `homepage-trending-${page}`;
//       let data = browseCache.get(cacheKey);
//       if (!data) {
//         data = await tmdbFetch("/trending/all/week", {
//           params: { page },
//         });
//         browseCache.set(cacheKey, data);
//       }

//       const results = (data.results || [])
//         .filter(
//           (item) => item.media_type === "movie" || item.media_type === "tv",
//         )
//         .map((item) =>
//           mapTMDBItem(
//             item,
//             item.media_type,
//             item.media_type === "movie" ? movieGenreMap : tvGenreMap,
//           ),
//         );

//       return res.json(results);
//     }

//     let publicSections = homeCache.get("homepage");

//     if (!publicSections) {
//       const [trending, upcoming, genreRows, tvShows] = await Promise.all([
//         getTrending(),
//         getUpcoming(),
//         getGenreRows(),
//         getTVShows(),
//       ]);

//       publicSections = {
//         trending,
//         upcoming,
//         genreRows,
//         tvShows,
//       };

//       homeCache.set("homepage", publicSections);
//     }

//     let continueWatching = [];
//     let recommended = [];
//     let becauseYouWatched = {
//       source: null,
//       items: [],
//     };

//     if (req.user) {
//       [continueWatching, recommended, becauseYouWatched] = await Promise.all([
//         getContinueWatching(req.user._id),
//         getRecommendedForUser(req.user._id),
//         getBecauseYouWatched(req.user._id),
//       ]);
//     }

//     return res.json({
//       ...publicSections,
//       continueWatching,
//       recommended,
//       becauseYouWatched,
//     });
//   } catch (err) {
//     console.error("TMDB API Error, falling back to mock data:", err);

//     return res.json({
//       trending: [
//         { id: 1, title: "Dune: Part Two", type: "movie", poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqqUTc5.jpg", rating: 8.5, genres: ["Sci-Fi", "Adventure"] },
//         { id: 2, title: "Oppenheimer", type: "movie", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", rating: 8.1, genres: ["Drama", "History"] },
//         { id: 3, title: "Shogun", type: "series", poster: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1Wf8MCWwG0.jpg", rating: 8.7, genres: ["Drama"] },
//       ],
//       upcoming: [],
//       genreRows: [{ title: "Popular Right Now", items: [ { id: 4, title: "Deadpool & Wolverine", type: "movie", poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", rating: 7.9, genres: ["Action"] } ] }],
//       tvShows: [],
//       continueWatching: [],
//       recommended: [],
//       becauseYouWatched: { source: null, items: [] }
//     });
//   }
// });

// router.get("/section", async (req, res) => {
//   try {
//     const { section, page = 1 } = req.query;

//     const pageNum = Math.max(1, Number(page));

//     const SECTION_HANDLERS = {
//       trending: () => getTrending(pageNum),

//       upcoming: () => getUpcoming(pageNum),

//       tv: () => getTVShows(pageNum),

//       action: () => getGenreContent("Action", pageNum),

//       comedy: () => getGenreContent("Comedy", pageNum),

//       drama: () => getGenreContent("Drama", pageNum),

//       "science-fiction": () => getGenreContent("Science Fiction", pageNum),

//       horror: () => getGenreContent("Horror", pageNum),

//       romance: () => getGenreContent("Romance", pageNum),

//       recommended: () => {
//         if (!req.user) return [];
//         return getRecommendedForUser(req.user._id, pageNum);
//       },

//       continueWatching: () => {
//         if (!req.user) return [];
//         return getContinueWatching(req.user._id, pageNum);
//       },

//       becauseYouWatched: async () => {
//         if (!req.user) return [];

//         const result = await getBecauseYouWatched(req.user._id, pageNum);

//         return result.items;
//       },
//     };

//     const handler = SECTION_HANDLERS[section];

//     if (!handler) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid section.",
//       });
//     }

//     const items = await handler();

//     return res.json(items);
//   } catch (err) {
//     console.error(err);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to load section.",
//     });
//   }
// });

// router.get("/queryContent", async (req, res) => {
//   try {
//     const { type = "", genre = "", q = "", limit = 100 } = req.query;
//     const page = parseInt(req.query.page) || 1;

//     //--------------------------------------------------
//     // Music (Spotify)
//     //--------------------------------------------------

//     if (type === "song") {
//       try {
//         const pageNum = Math.max(1, Number(req.query.page) || 1);
//         const pageSize = Number(limit) || 20;
//         const start = (pageNum - 1) * pageSize;
//         const end = start + pageSize;

//         const cacheKey = `song-${q || genre || "default"}`;
//         const cached = musicCache.get(cacheKey) || {
//           tracks: [],
//           exhausted: false,
//         };
//         let { tracks, exhausted } = cached;

//         // Only hit Spotify for more if we don't have enough cached
//         // and there's more to fetch.
//         if (tracks.length < end && !exhausted) {
//           const searchQuery = q
//             ? q
//             : genre
//               ? `genre:"${genre.toLowerCase()}"`
//               : "a";

//           const needed = end - tracks.length;
//           const { tracks: more, exhausted: nowExhausted } =
//             await spotifySearchTracksBatchMeta(
//               searchQuery,
//               needed,
//               tracks.length,
//             );

//           tracks = tracks.concat(more);
//           exhausted = nowExhausted;

//           musicCache.set(cacheKey, { tracks, exhausted });
//         }

//         const pageResults = tracks.slice(start, end);
//         const hasMore =
//           end < tracks.length ||
//           (!exhausted && pageResults.length === pageSize);

//         return res.json({
//           results: pageResults,
//           page: pageNum,
//           hasMore,
//         });
//       } catch (err) {
//         console.error("🔴 SPOTIFY ERROR MESSAGE:", err);

//         return res.status(500).json({
//           success: false,
//           message: "Failed to fetch music.",
//         });
//       }
//     }

//     //--------------------------------------------------
//     // Determine media types
//     //--------------------------------------------------

//     const mediaTypes = [];

//     if (!type) {
//       mediaTypes.push("movie", "tv");
//     } else if (type === "movie") {
//       mediaTypes.push("movie");
//     } else if (type === "series") {
//       mediaTypes.push("tv");
//     }

//     //--------------------------------------------------
//     // Load genre maps (24-hour cache)
//     //--------------------------------------------------

//     const genreMaps = {};

//     for (const mediaType of mediaTypes) {
//       const cacheKey = `genres-${mediaType}`;

//       let genreMap = genreCache.get(cacheKey);

//       if (!genreMap) {
//         const data = await tmdbFetch(`/genre/${mediaType}/list`);

//         genreMap = {};

//         data.genres.forEach((g) => {
//           genreMap[g.id] = g.name;
//         });

//         genreCache.set(cacheKey, genreMap);
//       }

//       genreMaps[mediaType] = genreMap;
//     }

//     let results = [];

//     //--------------------------------------------------
//     // Search / Discover / Trending
//     //--------------------------------------------------

//     for (const mediaType of mediaTypes) {
//       const genreMap = genreMaps[mediaType];

//       let genreId = "";

//       if (genre) {
//         const entry = Object.entries(genreMap).find(
//           ([, name]) => name.toLowerCase() === genre.toLowerCase(),
//         );

//         if (entry) {
//           genreId = entry[0];
//         }
//       }

//       let data;

//       //----------------------------------------------
//       // Search (no cache)
//       //----------------------------------------------

//       if (q) {
//         data = await tmdbFetch(`/search/${mediaType}`, {
//           params: {
//             query: q,
//             page,
//           },
//         });
//       }

//       //----------------------------------------------
//       // Discover (15-minute cache)
//       //----------------------------------------------
//       else if (genreId) {
//         const cacheKey = `discover-${mediaType}-${genreId}-${page}`;

//         data = browseCache.get(cacheKey);

//         if (!data) {
//           data = await tmdbFetch(`/discover/${mediaType}`, {
//             params: {
//               with_genres: genreId,
//               page,
//             },
//           });

//           browseCache.set(cacheKey, data);
//         }
//       }

//       //----------------------------------------------
//       // Trending (15-minute cache)
//       //----------------------------------------------
//       else {
//         const cacheKey = `trending-${mediaType}-${page}`;

//         data = browseCache.get(cacheKey);

//         if (!data) {
//           data = await tmdbFetch(`/trending/${mediaType}/week`, {
//             params: {
//               page,
//             },
//           });

//           browseCache.set(cacheKey, data);
//         }
//       }

//       let mapped = (data.results || []).map((item) =>
//         mapTMDBItem(item, mediaType, genreMap),
//       );

//       if (q && genre) {
//         mapped = mapped.filter((item) =>
//           item.genres.some((g) => g.toLowerCase() === genre.toLowerCase()),
//         );
//       }

//       results.push(...mapped);
//     }

//     //--------------------------------------------------
//     // Person search
//     //--------------------------------------------------

//     if (q) {
//       const personData = await tmdbFetch("/search/person", {
//         params: {
//           query: q,
//           page,
//         },
//       });

//       const people = (personData.results || []).slice(0, 5);

//       for (const person of people) {
//         const creditsData = await tmdbFetch(
//           `/person/${person.id}/combined_credits`,
//         );

//         for (const credit of creditsData.cast || []) {
//           if (credit.media_type !== "movie" && credit.media_type !== "tv") {
//             continue;
//           }

//           if (
//             type &&
//             ((type === "movie" && credit.media_type !== "movie") ||
//               (type === "series" && credit.media_type !== "tv"))
//           ) {
//             continue;
//           }

//           const genreMap =
//             genreMaps[credit.media_type === "movie" ? "movie" : "tv"];

//           const mapped = mapTMDBItem(credit, credit.media_type, genreMap);

//           if (
//             genre &&
//             !mapped.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
//           ) {
//             continue;
//           }

//           results.push(mapped);
//         }
//       }
//     }

//     //--------------------------------------------------
//     // Remove duplicates
//     //--------------------------------------------------

//     const seen = new Set();

//     results = results.filter((item) => {
//       const key = `${item.type}-${item.id}`;

//       if (seen.has(key)) {
//         return false;
//       }

//       seen.add(key);

//       return true;
//     });

//     //--------------------------------------------------
//     // Sort by rating
//     //--------------------------------------------------

//     results.sort((a, b) => b.avg_rating - a.avg_rating);

//     res.json(results.slice(0, Number(limit)));
//   } catch (err) {
//     console.error(err);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch content.",
//     });
//   }
// });

// module.exports = router;

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
const Review = require("../Models/Review");

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
        {
          id: 1,
          title: "Dune: Part Two",
          type: "movie",
          poster:
            "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqqUTc5.jpg",
          rating: 8.5,
          genres: ["Sci-Fi", "Adventure"],
        },
        {
          id: 2,
          title: "Oppenheimer",
          type: "movie",
          poster:
            "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
          rating: 8.1,
          genres: ["Drama", "History"],
        },
        {
          id: 3,
          title: "Shogun",
          type: "series",
          poster:
            "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1Wf8MCWwG0.jpg",
          rating: 8.7,
          genres: ["Drama"],
        },
      ],
      upcoming: [],
      genreRows: [
        {
          title: "Popular Right Now",
          items: [
            {
              id: 4,
              title: "Deadpool & Wolverine",
              type: "movie",
              poster:
                "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
              rating: 7.9,
              genres: ["Action"],
            },
          ],
        },
      ],
      tvShows: [],
      continueWatching: [],
      recommended: [],
      becauseYouWatched: { source: null, items: [] },
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

//--------------------------------------------------
// Sort helpers shared by every content type
//--------------------------------------------------

const SORTERS = {
  popularity: (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0),
  rating: (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0),
  newest: (a, b) => (b.year || 0) - (a.year || 0),
  title: (a, b) => (a.title || "").localeCompare(b.title || ""),
};

// TMDB's own `sort_by` param, used so paginated discover results already
// arrive close to the order we want (client-side sort below still runs as
// the final word once movie + tv results are merged together).
const TMDB_SORT_BY = {
  popularity: "popularity.desc",
  rating: "vote_average.desc",
  newest: { movie: "primary_release_date.desc", tv: "first_air_date.desc" },
  title: { movie: "original_title.asc", tv: "original_name.asc" },
};

// The UI shows one shared genre list for both Movies and Series, but TMDB
// uses different (and differently-named) genre taxonomies for movie vs tv.
// This maps the UI's genre label onto the actual TMDB genre name for a
// given media type, so we resolve the right id and — just as importantly —
// filter mapped results against the right name too. Genres with no real TV
// equivalent (Horror, Thriller, Romance) map to the closest available TV
// bucket rather than silently returning zero results.
const GENRE_ALIASES = {
  movie: {
    "sci-fi": "science fiction",
  },
  tv: {
    "sci-fi": "sci-fi & fantasy",
    fantasy: "sci-fi & fantasy",
    action: "action & adventure",
    horror: "sci-fi & fantasy",
    thriller: "crime",
    romance: "soap",
  },
};

function resolveGenreName(name, mediaType) {
  const alias = GENRE_ALIASES[mediaType]?.[name.toLowerCase()];
  return alias || name;
}

//--------------------------------------------------
// Site ratings (from our own Review collection) — used for display/sort
// (avg_rating) everywhere except the rating *filter*, which now checks
// TMDB's rating directly (see the filter block near the bottom of
// /queryContent). Items nobody has reviewed yet fall back to 0 so they
// still appear in the list, just ranked last under "Top Rated".
//--------------------------------------------------

async function getSiteRatingsMap(mediaType, ids) {
  const cleanIds = Array.from(new Set(ids.map(String).filter(Boolean)));
  if (!cleanIds.length) return {};

  const rows = await Review.aggregate([
    { $match: { mediaType, tmdbId: { $in: cleanIds } } },
    {
      $group: { _id: "$tmdbId", avg: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  const map = {};
  rows.forEach((r) => {
    map[`${mediaType}-${r._id}`] = { avg: r.avg, count: r.count };
  });
  return map;
}

// When a rating filter is active, we can't just filter whatever TMDB page
// happened to load (trending/discover only returns ~20 items per page —
// the specific movie/show someone actually rated on our site is very
// unlikely to be sitting on that page). Instead, go straight to the
// Review collection: it already stores title/posterUrl/mediaType at write
// time, so this needs zero extra TMDB calls and guarantees every item that
// meets the threshold is shown, not just ones that happened to also be
// trending right now.
async function getRatedItems(mediaTypes, minRating) {
  const rows = await Review.aggregate([
    { $match: { mediaType: { $in: mediaTypes } } },
    { $sort: { updatedAt: -1 } },
    {
      $group: {
        _id: { tmdbId: "$tmdbId", mediaType: "$mediaType" },
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
        title: { $first: "$title" },
        posterUrl: { $first: "$posterUrl" },
      },
    },
    { $match: { avg: { $gte: minRating } } },
  ]);

  return rows.map((r) => ({
    id: r._id.tmdbId,
    type: r._id.mediaType,
    title: r.title || "Untitled",
    poster: r.posterUrl || null,
    year: null,
    genres: [],
    avg_rating: Number(r.avg.toFixed(2)),
    reviewCount: r.count,
  }));
}

async function applySiteRatings(items) {
  const idsByType = { movie: [], tv: [] };

  items.forEach((item) => {
    if (idsByType[item.type]) idsByType[item.type].push(item.id);
  });

  const [movieRatings, tvRatings] = await Promise.all([
    getSiteRatingsMap("movie", idsByType.movie),
    getSiteRatingsMap("tv", idsByType.tv),
  ]);

  return items.map((item) => {
    const map = item.type === "movie" ? movieRatings : tvRatings;
    const entry = map[`${item.type}-${item.id}`];

    // mapTMDBItem already converts TMDB's raw 0–10 vote_average down to our
    // 0–5 scale (avg_rating: vote_average / 2) — so item.avg_rating here is
    // ALREADY on the 0–5 scale, not 0–10. Do not divide it again. Blend the
    // two: use the site average when people have actually reviewed it here,
    // otherwise fall back to TMDB's (already-0–5) rating rather than 0 — an
    // unreviewed item shouldn't be treated as "rated zero".
    const tmdbRatingOn5 = item.avg_rating || 0;

    return {
      ...item,
      tmdb_rating: tmdbRatingOn5, // 0–5 scale, matches our rating filter/UI
      avg_rating: entry ? Number(entry.avg.toFixed(2)) : tmdbRatingOn5,
      reviewCount: entry ? entry.count : 0,
    };
  });
}

router.get("/queryContent", async (req, res) => {
  try {
    const {
      type = "",
      genre = "", // legacy single-genre param, still honored
      genres: genresParam = "", // new multi-select param: comma-separated names
      year = "",
      rating = "",
      sortBy = "popularity",
      q = "",
      limit = 100,
    } = req.query;

    const page = parseInt(req.query.page) || 1;

    const selectedGenres = Array.from(
      new Set(
        [genre, ...genresParam.split(",")].map((g) => g.trim()).filter(Boolean),
      ),
    );

    const selectedYear = year ? parseInt(year, 10) : null;
    const minRating = rating !== "" ? parseFloat(rating) : null;
    const sorter = SORTERS[sortBy] || SORTERS.popularity;

    //--------------------------------------------------
    // Music (Spotify) — ratings now come from our own Review collection
    // (mediaType: "song"), not Spotify's popularity score. Other filters
    // (genre/year) still apply best-effort since Spotify tracks don't
    // reliably carry that metadata: fields we don't have are kept rather
    // than dropped.
    //--------------------------------------------------

    if (type === "song") {
      try {
        const pageNum = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Number(limit) || 20;
        const start = (pageNum - 1) * pageSize;
        const end = start + pageSize;

        const primaryGenre = selectedGenres[0] || "";
        // v2: bumped so this can't collide with any stale cache entries
        // saved under the old `genre:"..."` field-filter query format.
        const cacheKey = `song-v2-${q || primaryGenre || "default"}`;
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
            : primaryGenre
              ? primaryGenre // plain text — Spotify track search doesn't
              : // reliably honor a genre:"..." field filter
                "a";

          const needed = end - tracks.length;
          const { tracks: more, exhausted: nowExhausted } =
            await spotifySearchTracksBatchMeta(
              searchQuery,
              needed,
              tracks.length,
            );

          console.log(
            `[queryContent/song] query="${searchQuery}" fetched=${more.length} exhausted=${nowExhausted}`,
          );

          tracks = tracks.concat(more);
          exhausted = nowExhausted;

          musicCache.set(cacheKey, { tracks, exhausted });
        }

        let pageResults = tracks.slice(start, end);
        const rawCount = pageResults.length;

        if (selectedGenres.length) {
          pageResults = pageResults.filter((t) => {
            if (!t.genres || !t.genres.length) return true; // no data → keep
            return t.genres.some((g) =>
              selectedGenres.some(
                (sg) => sg.toLowerCase() === String(g).toLowerCase(),
              ),
            );
          });
        }

        if (selectedYear) {
          pageResults = pageResults.filter((t) => {
            // mapTrack() (spotify.service.js) sets `year` as a 4-char
            // string sliced from album.release_date — coerce before
            // comparing, or a strict `===` against our numeric
            // selectedYear silently fails for every track.
            const trackYear = t.year ? parseInt(t.year, 10) : null;
            if (!trackYear) return true; // no data → keep
            return trackYear === selectedYear;
          });
        }

        // Site ratings from our own Review collection (mediaType: "song").
        // Replaces the old Spotify-popularity approximation entirely.
        const trackIds = pageResults.map((t) => t.id).filter(Boolean);
        const songRatings = await getSiteRatingsMap("song", trackIds);

        pageResults = pageResults.map((t) => {
          const entry = songRatings[`song-${t.id}`];
          return {
            ...t,
            avg_rating: entry ? Number(entry.avg.toFixed(2)) : 0,
            reviewCount: entry ? entry.count : 0,
          };
        });

        if (minRating != null) {
          pageResults = pageResults.filter(
            (t) => (t.avg_rating || 0) >= minRating,
          );
        }

        console.log(
          `[queryContent/song] cacheKey="${cacheKey}" tracksInCache=${tracks.length} rawPage=${rawCount} afterFilters=${pageResults.length}`,
        );

        if (sortBy === "title") {
          pageResults = [...pageResults].sort((a, b) =>
            (a.title || a.name || "").localeCompare(b.title || b.name || ""),
          );
        } else if (sortBy === "newest") {
          pageResults = [...pageResults].sort(
            (a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0),
          );
        } else if (sortBy === "rating" || sortBy === "popularity") {
          // Both now rank by our own site rating (see SORTERS above for
          // the movie/tv equivalent) rather than Spotify's popularity.
          pageResults = [...pageResults].sort(
            (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0),
          );
        }

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

      // Translate each selected genre label to this media type's real TMDB
      // genre name (e.g. "Sci-Fi" → "Science Fiction" for movies, → "Sci-Fi
      // & Fantasy" for tv), then resolve that to an id.
      const translatedGenreNames = selectedGenres.map((g) =>
        resolveGenreName(g, mediaType),
      );

      const genreIds = translatedGenreNames
        .map((g) => {
          const entry = Object.entries(genreMap).find(
            ([, name]) => name.toLowerCase() === g.toLowerCase(),
          );
          return entry ? entry[0] : null;
        })
        .filter(Boolean);

      // Discover lets TMDB do the heavy lifting (genre/year/sort) whenever
      // there's no free-text search and at least one such filter is active.
      // Note: rating is now our own site data, not TMDB's — so it's applied
      // client-side below rather than via TMDB's discover params.
      const useDiscover =
        !q &&
        (genreIds.length > 0 ||
          selectedYear ||
          sortBy !== "popularity" ||
          minRating != null);

      let data;

      //----------------------------------------------
      // Search (no cache)
      //----------------------------------------------

      if (q) {
        const yearParamKey =
          mediaType === "movie"
            ? "primary_release_year"
            : "first_air_date_year";

        data = await tmdbFetch(`/search/${mediaType}`, {
          params: {
            query: q,
            page,
            ...(selectedYear ? { [yearParamKey]: selectedYear } : {}),
          },
        });
      }

      //----------------------------------------------
      // Discover (15-minute cache) — genre / year / sort
      //----------------------------------------------
      else if (useDiscover) {
        const sortConfig = TMDB_SORT_BY[sortBy];
        const tmdbSortBy =
          typeof sortConfig === "string"
            ? sortConfig
            : sortConfig?.[mediaType] || "popularity.desc";

        // minRating comes in on our 0–5 UI scale; TMDB's vote_average is
        // 0–10, so convert before sending it as a discover param.
        const tmdbMinVote = minRating != null ? minRating * 2 : null;

        const cacheKey = `discover-${mediaType}-${genreIds.join("|") || "any"}-${
          selectedYear || "any"
        }-${tmdbSortBy}-${tmdbMinVote ?? "any"}-${page}`;

        data = browseCache.get(cacheKey);

        if (!data) {
          const todayISO = new Date().toISOString().slice(0, 10);
          const dateLteKey =
            mediaType === "movie"
              ? "primary_release_date.lte"
              : "first_air_date.lte";

          data = await tmdbFetch(`/discover/${mediaType}`, {
            params: {
              page,
              sort_by: tmdbSortBy,
              // Pipe = OR: match ANY of the selected genres, not all of them.
              ...(genreIds.length ? { with_genres: genreIds.join("|") } : {}),
              ...(selectedYear
                ? {
                    [mediaType === "movie"
                      ? "primary_release_year"
                      : "first_air_date_year"]: selectedYear,
                  }
                : {}),
              // Let TMDB filter by rating across its whole catalog instead
              // of us filtering after the fact on whatever ~20 items a
              // single popularity-sorted page happened to return (which
              // could easily contain zero titles above the threshold).
              // vote_count.gte guards against a 10/10 title with 1 vote
              // topping the list.
              ...(tmdbMinVote != null
                ? { "vote_average.gte": tmdbMinVote, "vote_count.gte": 20 }
                : {}),
              // "Newest" sorts by furthest release date descending. TMDB has
              // a long tail of junk/placeholder entries with speculative
              // future dates (2045, 2099, etc). Cap at today so "newest"
              // means "most recently actually released", and drop
              // near-zero-vote noise that tends to carry those bad dates.
              ...(sortBy === "newest"
                ? { [dateLteKey]: todayISO, "vote_count.gte": 10 }
                : {}),
            },
          });

          browseCache.set(cacheKey, data);
        }
      }

      //----------------------------------------------
      // Trending (15-minute cache) — no filters active
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

      // Post-filter by genre whenever any genre is selected. This covers
      // search results (which TMDB can't filter by genre at all) and also
      // acts as a safety net after discover's OR-based with_genres call.
      // Matches against the *translated* names, since item.genres holds
      // TMDB's real genre names for this media type (e.g. "Soap"), not the
      // UI's label (e.g. "Romance").
      if (selectedGenres.length) {
        mapped = mapped.filter((item) =>
          item.genres.some((g) =>
            translatedGenreNames.some(
              (tg) => tg.toLowerCase() === g.toLowerCase(),
            ),
          ),
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

          if (selectedYear) {
            const creditYear = credit.release_date
              ? new Date(credit.release_date).getFullYear()
              : credit.first_air_date
                ? new Date(credit.first_air_date).getFullYear()
                : null;

            if (creditYear !== selectedYear) continue;
          }

          const genreMap =
            genreMaps[credit.media_type === "movie" ? "movie" : "tv"];

          const mapped = mapTMDBItem(credit, credit.media_type, genreMap);

          const creditTranslatedGenres = selectedGenres.map((g) =>
            resolveGenreName(g, credit.media_type),
          );

          if (
            selectedGenres.length &&
            !mapped.genres.some((g) =>
              creditTranslatedGenres.some(
                (tg) => tg.toLowerCase() === g.toLowerCase(),
              ),
            )
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
    // Site ratings — overwrite avg_rating with our own Review data so
    // sorting by rating reflects what people rated on this site, not
    // TMDB's score. Unreviewed items get avg_rating: 0 (falling back to
    // the TMDB-derived value — see applySiteRatings) rather than being
    // excluded outright. This also sets item.tmdb_rating, which is what
    // the rating *filter* below actually checks.
    //--------------------------------------------------

    results = await applySiteRatings(results);

    //--------------------------------------------------
    // Rating filter — TMDB rating only (not site reviews). tmdb_rating is
    // already on our 0–5 scale (see applySiteRatings above), same as
    // minRating, so compare directly — no further conversion. Applied last
    // so it's consistent across every source (search, discover, trending,
    // person credits).
    //--------------------------------------------------

    if (minRating != null) {
      results = results.filter((item) => (item.tmdb_rating || 0) >= minRating);
    }

    //--------------------------------------------------
    // Sort
    //--------------------------------------------------

    const userPickedSort =
      req.query.sortBy && req.query.sortBy !== "popularity";

    if (!q || userPickedSort) {
      results.sort(sorter);
    }

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
