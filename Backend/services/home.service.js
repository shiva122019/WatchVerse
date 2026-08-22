const NodeCache = require("node-cache");
const tmdb = require("../lib/tmdb");
const WatchList = require("../Models/WatchList");
const UserPreference = require("../Models/UserPreference");
const UserFavorite = require("../Models/UserFavorite");
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

const recommendationCache = new NodeCache({
  stdTTL: 900, // 15 minutes
  checkperiod: 120,
});

const becauseYouWatchedCache = new NodeCache({
  stdTTL: 900,
  checkperiod: 120,
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

    genres: item.genres
      ? item.genres.map((g) => g.name)
      : (item.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),

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

async function getGenreMaps() {
  const cached = genreCache.get("genreMaps");

  if (cached) return cached;

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

  const maps = { movieGenreMap, tvGenreMap };

  genreCache.set("genreMaps", maps);

  return maps;
}

async function getRecommendedForUser(userId, page = 1) {
  const PAGE_SIZE = 20;

  const cacheKey = `recommended-${userId}`;
  const cached = recommendationCache.get(cacheKey);

  if (cached) {
    return cached.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }

  const preferences = await UserPreference.findOne({ user: userId });

  if (!preferences) return [];

  // ---------------------------------------------------------
  // 1. Gather top preferences (sorted by score, positive only)
  // ---------------------------------------------------------

  const topGenres = preferences.genrePreferences
    .filter((g) => g.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const topActors = preferences.actorPreferences
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const topDirectors = (preferences.directorPreferences || [])
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Nothing to recommend from
  if (!topGenres.length && !topActors.length && !topDirectors.length) {
    return [];
  }

  // ---------------------------------------------------------
  // 2. Build exclusion set (watchlist + favorites)
  // ---------------------------------------------------------

  const [watchlistItems, favoriteItems] = await Promise.all([
    WatchList.find({ user: userId, mediaType: { $in: ["movie", "tv"] } })
      .select("tmdbId mediaType")
      .lean(),
    UserFavorite.find({
      userId,
      category: { $in: ["movie", "show"] },
    })
      .select("externalId category")
      .lean(),
  ]);

  const excludeSet = new Set();

  watchlistItems.forEach((item) => {
    excludeSet.add(`${item.mediaType}-${item.tmdbId}`);
  });

  favoriteItems.forEach((item) => {
    // UserFavorite uses "show" but TMDB uses "tv"
    const mediaType = item.category === "show" ? "tv" : item.category;
    excludeSet.add(`${mediaType}-${item.externalId}`);
  });

  // ---------------------------------------------------------
  // 3. Build TMDB fetch requests in parallel
  // ---------------------------------------------------------

  const { movieGenreMap, tvGenreMap } = await getGenreMaps();

  const genreMap = {
    ...movieGenreMap,
    ...tvGenreMap,
  };

  // Look up preference scores by id for fast access during scoring
  const genreScoreMap = {};
  preferences.genrePreferences.forEach((g) => {
    genreScoreMap[g.genreId] = g.score;
  });

  const actorScoreMap = {};
  preferences.actorPreferences.forEach((a) => {
    actorScoreMap[a.actorId] = a.score;
  });

  const directorScoreMap = {};
  (preferences.directorPreferences || []).forEach((d) => {
    directorScoreMap[d.directorId] = d.score;
  });

  const requests = [];
  const requestMeta = []; // track what each request is for

  // --- Genre discover (per-genre, movie + tv, pages 1-2) ---
  for (const genre of topGenres) {
    for (const mediaType of ["movie", "tv"]) {
      for (const pg of [1, 2]) {
        requests.push(
          tmdb.get(`/discover/${mediaType}`, {
            params: {
              with_genres: genre.genreId,
              sort_by: "popularity.desc",
              "vote_count.gte": mediaType === "movie" ? 100 : 50,
              page: pg,
            },
          }),
        );
        requestMeta.push({ type: "genre-discover", mediaType });
      }
    }
  }

  // --- Director discover (per-director, movie + tv) ---
  for (const director of topDirectors) {
    for (const mediaType of ["movie", "tv"]) {
      requests.push(
        tmdb.get(`/discover/${mediaType}`, {
          params: {
            with_crew: director.directorId,
            sort_by: "popularity.desc",
            page: 1,
          },
        }),
      );
      requestMeta.push({ type: "director-discover", mediaType });
    }
  }

  // --- Actor combined credits ---
  for (const actor of topActors) {
    requests.push(tmdb.get(`/person/${actor.actorId}/combined_credits`));
    requestMeta.push({ type: "actor-credits" });
  }

  const results = await Promise.allSettled(requests);

  // ---------------------------------------------------------
  // 4. Collect unique candidates
  // ---------------------------------------------------------

  const unique = new Map(); // key -> mapped item

  results.forEach((result, i) => {
    if (result.status !== "fulfilled") return;

    const meta = requestMeta[i];

    if (meta.type === "genre-discover" || meta.type === "director-discover") {
      const items = result.value.data.results || [];

      items.forEach((item) => {
        const key = `${meta.mediaType}-${item.id}`;

        if (!unique.has(key) && !excludeSet.has(key)) {
          unique.set(key, mapTMDBItem(item, meta.mediaType, genreMap));
        }
      });
    } else if (meta.type === "actor-credits") {
      const cast = result.value.data.cast || [];

      cast
        .filter(
          (item) => item.media_type === "movie" || item.media_type === "tv",
        )
        .forEach((item) => {
          const key = `${item.media_type}-${item.id}`;

          if (!unique.has(key) && !excludeSet.has(key)) {
            unique.set(
              key,
              mapTMDBItem(item, item.media_type, genreMap),
            );
          }
        });
    }
  });

  // ---------------------------------------------------------
  // 5. Score each candidate
  // ---------------------------------------------------------

  const currentYear = new Date().getFullYear();

  const scored = Array.from(unique.entries()).map(([key, item]) => {
    let score = 0;

    // Genre match: sum preference scores for each matching genre
    const itemGenreIds = item.genres
      ? item.genres
          .map((name) => {
            const entry = Object.entries(genreMap).find(
              ([, n]) => n === name,
            );
            return entry ? Number(entry[0]) : null;
          })
          .filter(Boolean)
      : [];

    itemGenreIds.forEach((gid) => {
      if (genreScoreMap[gid]) {
        score += genreScoreMap[gid] * 1.0;
      }
    });

    // Quality bonus (TMDB vote_average is 0-10, avg_rating is already 0-5)
    score += (item.avg_rating || 0) * 1.0;

    // Recency bonus: movies from the last 3 years get +3
    const releaseYear = item.release_year;
    if (releaseYear && currentYear - releaseYear <= 3) {
      score += 3;
    }

    return { ...item, _relevanceScore: score };
  });

  // ---------------------------------------------------------
  // 6. Sort by relevance score and paginate
  // ---------------------------------------------------------

  scored.sort((a, b) => b._relevanceScore - a._relevanceScore);

  // Strip internal scoring field before caching
  const recommendations = scored.map(({ _relevanceScore, ...rest }) => rest);

  recommendationCache.set(cacheKey, recommendations);

  return recommendations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}


async function getBecauseYouWatched(userId, page = 1) {
  const PAGE_SIZE = 20;

  const cacheKey = `because-${userId}`;
  const cached = becauseYouWatchedCache.get(cacheKey);

  if (cached) {
    return {
      source: cached.source,
      items: cached.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    };
  }

  const watched = await WatchList.find({
    user: userId,
    status: "watched",
    mediaType: { $in: ["movie", "tv"] }, // songs aren't TMDB-recommendable
  })
    .sort({ updatedAt: -1 })
    .limit(5);

  if (!watched.length) {
    return {
      source: null,
      items: [],
    };
  }

  const recent = watched[0];

  const watchlist = await WatchList.find({ user: userId });

  const existing = new Set(
    watchlist.map((item) => `${item.mediaType}-${item.tmdbId}`),
  );

  const { movieGenreMap, tvGenreMap } = await getGenreMaps();

  const genreMap = {
    ...movieGenreMap,
    ...tvGenreMap,
  };

  let source = null;
  try {
    const sourceRes = await tmdb.get(
      recent.mediaType === "movie"
        ? `/movie/${recent.tmdbId}`
        : `/tv/${recent.tmdbId}`,
    );
    source = mapTMDBItem(sourceRes.data, recent.mediaType, genreMap);
  } catch (err) {
    console.warn(
      `Failed to fetch TMDB info for recommendation source ${recent.tmdbId}:`,
      err.message,
    );
  }

  if (!source) {
    return {
      source: null,
      items: [],
    };
  }

  const responses = await Promise.all(
    watched.map(async (item) => {
      try {
        const res = await tmdb.get(
          item.mediaType === "movie"
            ? `/movie/${item.tmdbId}/recommendations`
            : `/tv/${item.tmdbId}/recommendations`,
        );
        return { success: true, data: res.data, mediaType: item.mediaType };
      } catch (err) {
        console.warn(
          `Failed to fetch TMDB recommendations for item ${item.tmdbId}:`,
          err.message,
        );
        return { success: false };
      }
    }),
  );

  const unique = new Map();

  responses
    .filter((res) => res.success)
    .forEach((response) => {
      const mediaType = response.mediaType;

      response.data.results.forEach((item) => {
        const key = `${mediaType}-${item.id}`;

        if (!unique.has(key) && !existing.has(key)) {
          unique.set(key, mapTMDBItem(item, mediaType, genreMap));
        }
      });
    });

  const items = Array.from(unique.values());

  becauseYouWatchedCache.set(cacheKey, {
    source,
    items,
  });

  return {
    source,
    items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}

async function getContinueWatching(userId, page = 1) {
  const { movieGenreMap, tvGenreMap } = await getGenreMaps();

  const watching = await WatchList.find({
    user: userId,
    status: "watching",
    mediaType: { $in: ["movie", "tv"] },
  })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * 20)
    .limit(20);

  if (!watching.length) return [];

  const requests = watching.map(async (item) => {
    try {
      const res = await tmdb.get(
        item.mediaType === "movie"
          ? `/movie/${item.tmdbId}`
          : `/tv/${item.tmdbId}`,
      );
      return { success: true, data: res.data, mediaType: item.mediaType };
    } catch (err) {
      console.warn(
        `Failed to fetch TMDB data for item ${item.tmdbId}:`,
        err.message,
      );
      return { success: false };
    }
  });

  const responses = await Promise.all(requests);

  return responses
    .filter((res) => res.success)
    .map((res) => {
      const mediaType = res.mediaType;

      return mapTMDBItem(
        res.data,
        mediaType,
        mediaType === "movie" ? movieGenreMap : tvGenreMap,
      );
    });
}

// async function getTVShows(tvGenreMap) {
//   const [popular, topRated] = await Promise.all([
//     tmdb.get("/tv/popular"),
//     tmdb.get("/tv/top_rated"),
//   ]);

//   const unique = new Map();

//   [...popular.data.results, ...topRated.data.results].forEach((show) => {
//     if (!unique.has(show.id)) {
//       unique.set(show.id, mapTMDBItem(show, "tv", tvGenreMap));
//     }
//   });

//   return Array.from(unique.values()).slice(0, 20);
// }

async function getTVShows(page = 1) {
  const { tvGenreMap } = await getGenreMaps();

  const [popular, topRated] = await Promise.all([
    tmdb.get("/tv/popular", {
      params: { page },
    }),

    tmdb.get("/tv/top_rated", {
      params: { page },
    }),
  ]);

  const unique = new Map();

  [...popular.data.results, ...topRated.data.results].forEach((show) => {
    if (!unique.has(show.id)) {
      unique.set(show.id, mapTMDBItem(show, "tv", tvGenreMap));
    }
  });

  return Array.from(unique.values());
}

async function getGenreRows() {
  const { movieGenreMap } = await getGenreMaps();

  const genres = [
    "Action",
    "Comedy",
    "Drama",
    "Science Fiction",
    "Horror",
    "Romance",
  ];

  const rows = {};

  await Promise.all(
    genres.map(async (genre) => {
      rows[genre] = await getGenreContent(genre);
    }),
  );

  return rows;
}

async function getGenreContent(genreName, page = 1) {
  const { movieGenreMap } = await getGenreMaps();

  const genres = {
    Action: 28,
    Comedy: 35,
    Drama: 18,
    "Science Fiction": 878,
    Horror: 27,
    Romance: 10749,
  };

  const { data } = await tmdb.get("/discover/movie", {
    params: {
      with_genres: genres[genreName],
      sort_by: "popularity.desc",
      page,
    },
  });

  return data.results.map((item) => mapTMDBItem(item, "movie", movieGenreMap));
}

// async function getUpcoming(movieGenreMap, tvGenreMap) {
//   const [movies, tv] = await Promise.all([
//     tmdb.get("/movie/upcoming"),
//     tmdb.get("/tv/on_the_air"),
//   ]);

//   return [
//     ...movies.data.results.map((item) =>
//       mapTMDBItem(item, "movie", movieGenreMap),
//     ),
//     ...tv.data.results.map((item) => mapTMDBItem(item, "tv", tvGenreMap)),
//   ].slice(0, 20);
// }

async function getUpcoming(page = 1) {
  const { movieGenreMap, tvGenreMap } = await getGenreMaps();

  const [movies, tv] = await Promise.all([
    tmdb.get("/movie/upcoming", {
      params: { page },
    }),
    tmdb.get("/tv/on_the_air", {
      params: { page },
    }),
  ]);

  return [
    ...movies.data.results.map((item) =>
      mapTMDBItem(item, "movie", movieGenreMap),
    ),

    ...tv.data.results.map((item) => mapTMDBItem(item, "tv", tvGenreMap)),
  ];
}

// async function getTrending(movieGenreMap, tvGenreMap) {
//   const res = await tmdb.get("/trending/all/week");

//   return res.data.results
//     .filter((item) => item.media_type === "movie" || item.media_type === "tv")
//     .slice(0, 10)
//     .map((item) =>
//       mapTMDBItem(
//         item,
//         item.media_type,
//         item.media_type === "movie" ? movieGenreMap : tvGenreMap,
//       ),
//     );
// }

async function getTrending(page = 1) {
  const { movieGenreMap, tvGenreMap } = await getGenreMaps();

  const { data } = await tmdb.get("/trending/all/week", {
    params: { page },
  });

  return data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) =>
      mapTMDBItem(
        item,
        item.media_type,
        item.media_type === "movie" ? movieGenreMap : tvGenreMap,
      ),
    );
}

module.exports = {
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
  getGenreContent,
  getTrending,
  getContinueWatching,
};
