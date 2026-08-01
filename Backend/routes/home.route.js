const router = require("express").Router();
const tmdb = require("../lib/tmdb");
const { musicCache, spotifySearchTracks, spotifySearchAll } = require("../lib/spotify");
const {
  homeCache,
  browseCache,
  genreCache,
  mapTMDBItem,
  tmdbFetch,
  getRecommendedForUser,
  getBecauseYouWatched,
  getTVShows,
  getUpcoming,
  getGenreRows,
  getTrending,
  getContinueWatching,
} = require("../services/home.service");

// router.get("/", async (req, res) => {
//   try {
//     //---------------------------------------------------
//     // Cache
//     //---------------------------------------------------

//     const cached = homeCache.get("homepage");

//     if (cached) {
//       return res.json(cached);
//     }

//     //---------------------------------------------------
//     // Genre Maps
//     //---------------------------------------------------

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

//     //---------------------------------------------------
//     // Homepage Requests
//     //---------------------------------------------------

//     const responses = await Promise.allSettled([
//       tmdb.get("/trending/all/week"),
//       tmdb.get("/movie/popular"),
//       tmdb.get("/movie/top_rated"),
//       tmdb.get("/tv/popular"),
//       tmdb.get("/tv/top_rated"),
//     ]);

//     const getData = (index) =>
//       responses[index].status === "fulfilled"
//         ? responses[index].value.data.results
//         : [];

//     //---------------------------------------------------
//     // Trending
//     //---------------------------------------------------

//     const trending = getData(0)
//       .filter((item) => item.media_type === "movie" || item.media_type === "tv")
//       .map((item) =>
//         mapTMDBItem(
//           item,
//           item.media_type,
//           item.media_type === "movie" ? movieGenreMap : tvGenreMap,
//         ),
//       );

//     //---------------------------------------------------
//     // Popular Movies
//     //---------------------------------------------------

//     const popularMovies = getData(1).map((item) =>
//       mapTMDBItem(item, "movie", movieGenreMap),
//     );

//     //---------------------------------------------------
//     // Top Rated Movies
//     //---------------------------------------------------

//     const topRatedMovies = getData(2).map((item) =>
//       mapTMDBItem(item, "movie", movieGenreMap),
//     );

//     //---------------------------------------------------
//     // Popular Series
//     //---------------------------------------------------

//     const popularSeries = getData(3).map((item) =>
//       mapTMDBItem(item, "tv", tvGenreMap),
//     );

//     //---------------------------------------------------
//     // Top Rated Series
//     //---------------------------------------------------

//     const topRatedSeries = getData(4).map((item) =>
//       mapTMDBItem(item, "tv", tvGenreMap),
//     );

//     //---------------------------------------------------
//     // Featured
//     //---------------------------------------------------

//     const featured =
//       trending.length > 0
//         ? trending[0]
//         : popularMovies[0] || popularSeries[0] || null;

//     //---------------------------------------------------
//     // Response
//     //---------------------------------------------------

//     if (req.user) {
//       const recommended = req.user
//         ? await getRecommendedForUser(req.user._id)
//         : [];

//       const becauseYouWatched = req.user
//         ? await getBecauseYouWatched(req.user._id)
//         : [];
//     }

//     const response = {
//       featured,

//       trending,

//       popularMovies,

//       topRatedMovies,

//       popularSeries,

//       topRatedSeries,

//       recommended,

//       becauseYouWatched,
//     };

//     //---------------------------------------------------
//     // Save Cache
//     //---------------------------------------------------

//     homeCache.set("homepage", response);

//     res.json(response);
//   } catch (err) {
//     console.error(err.response?.data || err.message);

//     res.status(500).json({
//       success: false,
//       message: "Unable to load homepage.",
//     });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    //---------------------------------------------------
    // Genre Maps
    //---------------------------------------------------

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
        .filter((item) => item.media_type === "movie" || item.media_type === "tv")
        .map((item) =>
          mapTMDBItem(
            item,
            item.media_type,
            item.media_type === "movie" ? movieGenreMap : tvGenreMap,
          ),
        );

      return res.json(results);
    }

    //---------------------------------------------------
    // Public Homepage (Cached)
    //---------------------------------------------------

    let publicSections = homeCache.get("homepage");

    if (!publicSections) {
      const [trending, upcoming, genreRows, tvShows] = await Promise.all([
        getTrending(movieGenreMap, tvGenreMap),
        getUpcoming(movieGenreMap, tvGenreMap),
        getGenreRows(movieGenreMap),
        getTVShows(tvGenreMap),
      ]);

      publicSections = {
        trending,
        upcoming,
        genreRows,
        tvShows,
      };

      homeCache.set("homepage", publicSections);
    }

    //---------------------------------------------------
    // Personalized Sections
    //---------------------------------------------------

    let continueWatching = [];
    let recommended = [];
    let becauseYouWatched = [];

    if (req.user) {
      [continueWatching, recommended, becauseYouWatched] = await Promise.all([
        getContinueWatching(req.user._id),
        getRecommendedForUser(req.user._id),
        getBecauseYouWatched(req.user._id),
      ]);
    }

    //---------------------------------------------------
    // Response
    //---------------------------------------------------

    res.json({
      ...publicSections,
      continueWatching,
      recommended,
      becauseYouWatched,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      success: false,
      message: "Unable to load homepage.",
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
    const cacheKey = `song-${q || genre || "default"}`;
    const cached = musicCache.get(cacheKey);

    if (cached) {
      return res.json(cached.slice(0, Number(limit)));
    }

    let results;

    if (q) {
      results = await spotifySearchTracks(q, 10);
    } else if (genre) {
      results = await spotifySearchTracks(`genre:"${genre.toLowerCase()}"`, 10);
    } else {
      results = await spotifySearchAll(10);
    }

    musicCache.set(cacheKey, results);

    return res.json(results.slice(0, Number(limit)));
  } catch (err) {
    console.error(err);

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