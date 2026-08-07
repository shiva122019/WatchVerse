const router = require("express").Router();
const User = require("../Models/User.js");
const WatchList = require("../Models/WatchList.js");
const UserPreference = require("../Models/UserPreference.js");
const axios = require("axios");
const rax = require("retry-axios");
const { spotifyGetTrack } = require("../lib/spotify.js");

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

//to display all movies/series/songs in the watchlist
router.get("/content", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please log in.",
      });
    }

    const watchlist = await WatchList.find({
      user: req.user._id,
    });
    const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
    const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

    const response = await Promise.all(
      watchlist.map(async (entry) => {
        //--------------------------------------------------
        // Song (Spotify)
        //--------------------------------------------------
        if (entry.mediaType === "song") {
          try {
            const track = await spotifyGetTrack(entry.tmdbId);
            return {
              id: entry._id,
              content_id: entry.tmdbId,
              status: entry.status,
              content: {
                id: track.id,
                title: track.title,
                type: "song",
                avg_rating: track.avg_rating,
                release_year: track.release_year
                  ? Number(track.release_year)
                  : null,
                genres: [],
                description: track.description,
                cover_url: track.cover_url,
                backdrop_url: track.backdrop_url,
              },
            };
          } catch (err) {
            console.error(
              `Failed to load spotify track ${entry.tmdbId}:`,
              err.message,
            );
            return null;
          }
        }

        //--------------------------------------------------
        // Movie / Series (TMDB) — unchanged
        //--------------------------------------------------
        const tmdbResponse = await tmdb(`/${entry.mediaType}/${entry.tmdbId}`);
        const movie = tmdbResponse.data;
        return {
          id: entry._id,

          content_id: entry.tmdbId,

          status: entry.status,

          content: {
            id: movie.id,

            title: movie.title || movie.name,

            type: entry.mediaType,

            avg_rating: Number((movie.vote_average / 2).toFixed(1)),

            release_year: parseInt(
              (movie.release_date || movie.first_air_date).slice(0, 4),
            ),

            genres: movie.genres.map((g) => g.name),

            description: movie.overview,

            cover_url: movie.poster_path
              ? IMAGE_BASE + movie.poster_path
              : null,

            backdrop_url: movie.backdrop_path
              ? BACKDROP_BASE + movie.backdrop_path
              : null,
          },
        };
      }),
    );

    // Drop any entries that failed to resolve (e.g. deleted spotify track)
    res.json(response.filter(Boolean));
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch watchlist.",
    });
  }
});

//to add new things to watchlist
router.post("/", async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const { tmdbId, mediaType, status } = req.body;

    if (!tmdbId || !mediaType || !status) {
      return res.status(400).json({
        success: false,
        message: "tmdbId, mediaType and status are required",
      });
    }

    if (!["movie", "tv", "song"].includes(mediaType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media type",
      });
    }

    if (!["want", "watching", "watched"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid watch status",
      });
    }

    let title = null;
    let posterUrl = null;

    if (mediaType === "movie" || mediaType === "tv") {
      const { data } = await tmdb.get(`/${mediaType}/${tmdbId}`);

      title = data.title || data.name || null;

      posterUrl = data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null;
    } else {
      // TODO: Replace with Spotify lookup when song watchlists are supported.
      title = "Unknown Song";
      posterUrl = null;
    }

    const watchlist = await WatchList.findOneAndUpdate(
      {
        user: req.user._id,
        tmdbId,
      },
      {
        user: req.user._id,
        tmdbId,
        mediaType,
        status,
        title,
        posterUrl,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.json({
      success: true,
      watchlist,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to update watchlist",
    });
  }
});

//to get the status of an item that u are viewing
router.get("/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: "Login required",
      });
    }

    // NOTE: schema field is `user`, not `userId` — fixed below.
    const item = await WatchList.findOne({
      user: req.user._id,
      tmdbId: String(contentId),
    });

    if (!item) {
      return res.json({
        status: null,
      });
    }

    res.json({
      status: item.status,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch watchlist status",
    });
  }
});

router.delete("/:tmdbId", async (req, res) => {
  try {
    const tmdbId = String(req.params.tmdbId);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please log in first.",
      });
    }

    const deletedMovie = await WatchList.findOneAndDelete({
      user: req.user._id,
      tmdbId,
    });

    res.status(200).json({
      success: true,
      message: "Movie removed from watchlist.",
      removed: deletedMovie,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

/**
 * Fetch TMDB details + credits for a single item and incrementally
 * update the user's genre / actor preference scores. Movie/TV only.
 */
async function updatePreferencesFromWatchlist(
  userId,
  tmdbId,
  mediaType,
  weight,
) {
  const detailsEndpoint = `/${mediaType}/${tmdbId}`;
  const creditsEndpoint = `/${mediaType}/${tmdbId}/credits`;

  const [detailsRes, creditsRes] = await Promise.all([
    tmdb.get(detailsEndpoint),
    tmdb.get(creditsEndpoint),
  ]);

  const details = detailsRes.data;
  const credits = creditsRes.data;

  const genreUpdates = (details.genres || []).map((genre) => ({
    genreId: genre.id,
    genreName: genre.name,
    weight,
  }));

  const actorUpdates = (credits.cast || []).slice(0, 5).map((actor) => ({
    actorId: actor.id,
    actorName: actor.name,
    weight,
  }));

  let pref = await UserPreference.findOne({ user: userId });

  if (!pref) {
    pref = new UserPreference({ user: userId });
  }

  for (const g of genreUpdates) {
    const existing = pref.genrePreferences.find((p) => p.genreId === g.genreId);
    if (existing) {
      existing.score = Math.min(100, Math.max(-100, existing.score + g.weight));
    } else {
      pref.genrePreferences.push({
        genreId: g.genreId,
        genreName: g.genreName,
        score: g.weight,
      });
    }
  }

  for (const a of actorUpdates) {
    const existing = pref.actorPreferences.find((p) => p.actorId === a.actorId);
    if (existing) {
      existing.score = Math.min(100, Math.max(-100, existing.score + a.weight));
    } else {
      pref.actorPreferences.push({
        actorId: a.actorId,
        actorName: a.actorName,
        score: a.weight,
      });
    }
  }

  pref.genrePreferences.sort((a, b) => b.score - a.score);
  pref.actorPreferences.sort((a, b) => b.score - a.score);

  await pref.save();
}

module.exports = router;
