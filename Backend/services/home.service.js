const NodeCache = require("node-cache");
const tmdb = require("../lib/tmdb");
const WatchList = require("../Models/WatchList");
const UserPreference = require("../Models/UserPreference");
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

async function getRecommendedForUser(userId) {
  const preferences = await UserPreference.findOne({ user: userId });

  if (!preferences) {
    return [];
  }

  const topGenres = preferences.genrePreferences
    .filter((genre) => genre.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const topActors = preferences.actorPreferences
    .filter((actor) => actor.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const genreIds = topGenres.map((genre) => genre.genreId).join(",");

  const [movieGenresRes, tvGenresRes] = await Promise.all([
    tmdb.get("/genre/movie/list"),
    tmdb.get("/genre/tv/list"),
  ]);

  const genreMap = {};

  movieGenresRes.data.genres.forEach((genre) => {
    genreMap[genre.id] = genre.name;
  });

  tvGenresRes.data.genres.forEach((genre) => {
    genreMap[genre.id] = genre.name;
  });

  const requests = [];

  // Genre-based recommendations
  requests.push(
    tmdb.get("/discover/movie", {
      params: {
        with_genres: genreIds,
        sort_by: "popularity.desc",
        vote_count_gte: 1000,
      },
    }),
  );

  requests.push(
    tmdb.get("/discover/tv", {
      params: {
        with_genres: genreIds,
        sort_by: "popularity.desc",
        vote_count_gte: 500,
      },
    }),
  );

  // Actor-based recommendations
  topActors.forEach((actor) => {
    requests.push(tmdb.get(`/person/${actor.actorId}/combined_credits`));
  });

  const responses = await Promise.all(requests);

  const unique = new Map();

  // Genre results
  responses[0].data.results.forEach((movie) => {
    const key = `movie-${movie.id}`;

    if (!unique.has(key)) {
      unique.set(key, mapTMDBItem(movie, "movie", genreMap));
    }
  });

  responses[1].data.results.forEach((show) => {
    const key = `tv-${show.id}`;

    if (!unique.has(key)) {
      unique.set(key, mapTMDBItem(show, "tv", genreMap));
    }
  });

  // Actor results
  for (let i = 2; i < responses.length; i++) {
    responses[i].data.cast
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)
      .forEach((item) => {
        if (item.media_type !== "movie" && item.media_type !== "tv") {
          return;
        }

        const key = `${item.media_type}-${item.id}`;

        if (!unique.has(key)) {
          unique.set(key, mapTMDBItem(item, item.media_type, genreMap));
        }
      });
  }

  return Array.from(unique.values())
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 20);
}

async function getBecauseYouWatched(userId) {
  const watched = await WatchList.find({
    user: userId,
    status: "watched",
  })
    .sort({ updatedAt: -1 })
    .limit(5);

  if (!watched.length) {
    return {
      source: null,
      items: [],
    };
  }

  // Recently watched item
  const recent = watched[0];

  // Everything already in the user's watchlist
  const watchlist = await WatchList.find({ user: userId });

  const existing = new Set(
    watchlist.map((item) => `${item.mediaType}-${item.tmdbId}`),
  );

  //---------------------------------------------------
  // Genre Maps
  //---------------------------------------------------

  const [movieGenresRes, tvGenresRes] = await Promise.all([
    tmdb.get("/genre/movie/list"),
    tmdb.get("/genre/tv/list"),
  ]);

  const genreMap = {};

  movieGenresRes.data.genres.forEach((g) => {
    genreMap[g.id] = g.name;
  });

  tvGenresRes.data.genres.forEach((g) => {
    genreMap[g.id] = g.name;
  });

  //---------------------------------------------------
  // Source Item
  //---------------------------------------------------

  const sourceRes = await tmdb.get(
    recent.mediaType === "movie"
      ? `/movie/${recent.tmdbId}`
      : `/tv/${recent.tmdbId}`,
  );

  const source = mapTMDBItem(sourceRes.data, recent.mediaType, genreMap);

  //---------------------------------------------------
  // Recommendations
  //---------------------------------------------------

  const requests = watched.map((item) =>
    tmdb.get(
      item.mediaType === "movie"
        ? `/movie/${item.tmdbId}/recommendations`
        : `/tv/${item.tmdbId}/recommendations`,
    ),
  );

  const responses = await Promise.all(requests);

  const unique = new Map();

  responses.forEach((response, index) => {
    const mediaType = watched[index].mediaType;

    response.data.results.forEach((item) => {
      const key = `${mediaType}-${item.id}`;

      if (!unique.has(key) && !existing.has(key)) {
        unique.set(key, mapTMDBItem(item, mediaType, genreMap));
      }
    });
  });

  return {
    source,
    items: Array.from(unique.values()).slice(0, 20),
  };
}

async function getTVShows(tvGenreMap) {
  const [popular, topRated] = await Promise.all([
    tmdb.get("/tv/popular"),
    tmdb.get("/tv/top_rated"),
  ]);

  const unique = new Map();

  [...popular.data.results, ...topRated.data.results].forEach((show) => {
    if (!unique.has(show.id)) {
      unique.set(show.id, mapTMDBItem(show, "tv", tvGenreMap));
    }
  });

  return Array.from(unique.values()).slice(0, 20);
}

async function getGenreRows(movieGenreMap) {
  const genres = [
    { name: "Action", id: 28 },
    { name: "Comedy", id: 35 },
    { name: "Drama", id: 18 },
    { name: "Science Fiction", id: 878 },
    { name: "Horror", id: 27 },
    { name: "Romance", id: 10749 },
  ];

  const requests = genres.map((genre) =>
    tmdb.get("/discover/movie", {
      params: {
        with_genres: genre.id,
        sort_by: "popularity.desc",
      },
    }),
  );

  const responses = await Promise.all(requests);

  const rows = {};

  responses.forEach((response, index) => {
    rows[genres[index].name] = response.data.results.map((item) =>
      mapTMDBItem(item, "movie", movieGenreMap),
    );
  });

  return rows;
}

async function getUpcoming(movieGenreMap, tvGenreMap) {
  const [movies, tv] = await Promise.all([
    tmdb.get("/movie/upcoming"),
    tmdb.get("/tv/on_the_air"),
  ]);

  return [
    ...movies.data.results.map((item) =>
      mapTMDBItem(item, "movie", movieGenreMap),
    ),
    ...tv.data.results.map((item) => mapTMDBItem(item, "tv", tvGenreMap)),
  ].slice(0, 20);
}

async function getTrending(movieGenreMap, tvGenreMap) {
  const res = await tmdb.get("/trending/all/week");

  return res.data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .slice(0, 10)
    .map((item) =>
      mapTMDBItem(
        item,
        item.media_type,
        item.media_type === "movie" ? movieGenreMap : tvGenreMap,
      ),
    );
}

async function getContinueWatching(userId) {
  const watching = await WatchList.find({
    user: userId,
    status: "watching",
  })
    .sort({ updatedAt: -1 })
    .limit(20);

  if (!watching.length) {
    return [];
  }

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

  const requests = watching.map((item) =>
    tmdb.get(
      item.mediaType === "movie"
        ? `/movie/${item.tmdbId}`
        : `/tv/${item.tmdbId}`,
    ),
  );

  const responses = await Promise.all(requests);

  return responses.map((res, index) => {
    const mediaType = watching[index].mediaType;

    return mapTMDBItem(
      res.data,
      mediaType,
      mediaType === "movie" ? movieGenreMap : tvGenreMap,
    );
  });
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
  getTrending,
  getContinueWatching,
};
