router = require("express").Router();
const axios = require("axios");
const rax = require("retry-axios");
reviewContent = require("../Models/reviewContent.js");

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
  timeout: 10000,
});

tmdb.defaults.raxConfig = {
  retry: 10,
  backoffType: "exponential",
  retryDelay: 100,
};

rax.attach(tmdb);

//---------------------------------------------------
// Spotify Client (Client Credentials Flow)
//---------------------------------------------------

let spotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < spotifyTokenExpiry) {
    return spotifyToken;
  }

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
      },
    }
  );

  spotifyToken = res.data.access_token;
  spotifyTokenExpiry = Date.now() + res.data.expires_in * 1000 - 60000;

  return spotifyToken;
}

const spotify = axios.create({
  baseURL: "https://api.spotify.com/v1",
  timeout: 10000,
});

spotify.interceptors.request.use(async (config) => {
  const token = await getSpotifyToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

router.get("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!["movie", "series", "tv", "song"].includes(type)) {
      return res.status(400).json({
        error: "Invalid content type",
      });
    }

    //--------------------------------------------------
    // Song (Spotify)
    //--------------------------------------------------

    if (type === "song") {
      const { data: track } = await spotify.get(`/tracks/${id}`);

      const cover = track.album?.images?.[0]?.url || null;

      const durationMs = track.duration_ms || 0;
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000)
        .toString()
        .padStart(2, "0");

      return res.json({
        id: track.id,

        type: "song",

        title: track.name,

        description: track.album?.name
          ? `From the album "${track.album.name}"`
          : null,

        cover_url: cover,

        backdrop_url: cover,

        release_year: track.album?.release_date
          ? Number(track.album.release_date.substring(0, 4))
          : null,

        duration: durationMs ? `${minutes}:${seconds}` : null,

        language: null,

        genres: [],

        creator: (track.artists || []).map((a) => a.name).join(", "),

        cast: [],

        avg_rating: 0,

        review_count: 0,
      });
    }

    //--------------------------------------------------
    // Movie / Series (TMDB)
    //--------------------------------------------------

    const endpoint = type === "movie" ? "movie" : "tv";

    const details = await tmdb.get(`/${endpoint}/${id}`);
    const item = details.data;
    const credits = await tmdb.get(`/${endpoint}/${id}/credits`);

    const crew = credits.data.crew || [];
    const cast = credits.data.cast || [];

    let creator = null;

    if (type === "movie") {
      creator = crew.find((p) => p.job === "Director")?.name || null;
    } else {
      creator = item.created_by?.map((c) => c.name).join(", ") || null;
    }

    // Cached review statistics
    const cache = await reviewContent.findOne({
      tmdbId: Number(id),
    });

    res.json({
      id: item.id,

      type,

      title: item.title || item.name,

      description: item.overview,

      cover_url: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,

      backdrop_url: item.backdrop_path
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
        : null,

      release_year:
        (item.release_date || item.first_air_date || "").substring(0, 4) ||
        null,

      duration:
        type === "movie"
          ? `${item.runtime} min`
          : `${item.number_of_seasons} Season${
              item.number_of_seasons === 1 ? "" : "s"
            }`,

      language: item.original_language?.toUpperCase(),

      genres: item.genres.map((g) => g.name),

      creator,

      cast: cast.slice(0, 10).map((person) => person.name),

      avg_rating: cache?.averageRating ?? 0,

      review_count: cache?.totalReviews ?? 0,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch content",
    });
  }
});

module.exports = router;