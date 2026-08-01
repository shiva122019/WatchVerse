const axios = require("axios");
const rax = require("retry-axios");
async function getTrailerUrl(endpoint, id) {
  try {
    const { data } = await tmdb.get(`/${endpoint}/${id}/videos`);

    const videos = data.results || [];

    const trailer =
      videos.find(
        (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
      ) ||
      videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
      videos.find((v) => v.site === "YouTube");

    if (!trailer) return null;

    return `https://www.youtube.com/embed/${trailer.key}`;
  } catch (err) {
    console.error("Failed to fetch trailer:", err.message);
    return null;
  }
}

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
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
          ).toString("base64"),
      },
    },
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

module.exports = { getTrailerUrl, spotify, getSpotifyToken, tmdb };
