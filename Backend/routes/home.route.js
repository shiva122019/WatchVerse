const router = require("express").Router();
const NodeCache = require("node-cache");
const axios = require("axios");
const rax = require("retry-axios");

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
  timeout: 100000,
});

tmdb.defaults.raxConfig = {
  retry: 10,
  backoffType: "exponential",
  retryDelay: 100,
};

rax.attach(tmdb);

const homeCache = new NodeCache({
  stdTTL: 900,
  checkperiod: 120,
});

const browseCache = new NodeCache({
  stdTTL: 900,
  checkperiod: 120,
});

const genreCache = new NodeCache({
  stdTTL: 86400,
  checkperiod: 3600,
});

function mapTMDBItem(item, mediaType, genreMap) {
  return {
    id: item.id,

    title: item.title || item.name,

    type: mediaType === "tv" ? "series" : "movie",

    avg_rating: Number((item.vote_average / 2).toFixed(1)),

    release_year: item.release_date
      ? Number(item.release_date.substring(0, 4))
      : item.first_air_date
        ? Number(item.first_air_date.substring(0, 4))
        : null,

    genres: (item.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),

    description: item.overview,

    cover_url: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,

    backdrop_url: item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : null,
  };
}

async function tmdbFetch(url, config = {}) {
  try {
    const { data } = await tmdb.get(url, config);
    return data;
  } catch (err) {
    console.error("TMDB Error:", url);

    if (err.response) {
      console.error(err.response.status);
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }

    throw err;
  }
}

router.get("/", async (req, res) => {
  try {
    //---------------------------------------------------
    // Cache
    //---------------------------------------------------

    const cached = homeCache.get("homepage");

    if (cached) {
      return res.json(cached);
    }

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

    //---------------------------------------------------
    // Homepage Requests
    //---------------------------------------------------

    const responses = await Promise.allSettled([
      tmdb.get("/trending/all/week"),
      tmdb.get("/movie/popular"),
      tmdb.get("/movie/top_rated"),
      tmdb.get("/tv/popular"),
      tmdb.get("/tv/top_rated"),
    ]);

    const getData = (index) =>
      responses[index].status === "fulfilled"
        ? responses[index].value.data.results
        : [];

    //---------------------------------------------------
    // Trending
    //---------------------------------------------------

    const trending = getData(0)
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .map((item) =>
        mapTMDBItem(
          item,
          item.media_type,
          item.media_type === "movie" ? movieGenreMap : tvGenreMap,
        ),
      );

    //---------------------------------------------------
    // Popular Movies
    //---------------------------------------------------

    const popularMovies = getData(1).map((item) =>
      mapTMDBItem(item, "movie", movieGenreMap),
    );

    //---------------------------------------------------
    // Top Rated Movies
    //---------------------------------------------------

    const topRatedMovies = getData(2).map((item) =>
      mapTMDBItem(item, "movie", movieGenreMap),
    );

    //---------------------------------------------------
    // Popular Series
    //---------------------------------------------------

    const popularSeries = getData(3).map((item) =>
      mapTMDBItem(item, "tv", tvGenreMap),
    );

    //---------------------------------------------------
    // Top Rated Series
    //---------------------------------------------------

    const topRatedSeries = getData(4).map((item) =>
      mapTMDBItem(item, "tv", tvGenreMap),
    );

    //---------------------------------------------------
    // Featured
    //---------------------------------------------------

    const featured =
      trending.length > 0
        ? trending[0]
        : popularMovies[0] || popularSeries[0] || null;

    //---------------------------------------------------
    // Response
    //---------------------------------------------------

    const response = {
      featured,

      trending,

      popularMovies,

      topRatedMovies,

      popularSeries,

      topRatedSeries,
    };

    //---------------------------------------------------
    // Save Cache
    //---------------------------------------------------

    homeCache.set("homepage", response);

    res.json(response);
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

    if (type === "song") {
      return res.json([]);
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
          },
        });
      }

      //----------------------------------------------
      // Discover (15-minute cache)
      //----------------------------------------------
      else if (genreId) {
        const cacheKey = `discover-${mediaType}-${genreId}`;

        data = browseCache.get(cacheKey);

        if (!data) {
          data = await tmdbFetch(`/discover/${mediaType}`, {
            params: {
              with_genres: genreId,
            },
          });

          browseCache.set(cacheKey, data);
        }
      }

      //----------------------------------------------
      // Trending (15-minute cache)
      //----------------------------------------------
      else {
        const cacheKey = `trending-${mediaType}`;

        data = browseCache.get(cacheKey);

        if (!data) {
          data = await tmdbFetch(`/trending/${mediaType}/week`);

          browseCache.set(cacheKey, data);
        }
      }

      let mapped = data.results.map((item) =>
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
