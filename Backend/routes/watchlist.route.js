const router = require("express").Router();
const User = require("../Models/User.js");
const WatchList = require("../Models/WatchList.js");
const axios = require("axios");
const rax = require("retry-axios");

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

//to display all movies in the watchlist
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

    res.json(response);
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
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please log in.",
      });
    }

    const { tmdbId, mediaType, status } = req.body;

    if (!tmdbId || !mediaType || !status) {
      return res.status(400).json({
        success: false,
        message: "tmdbId, mediaType and status are required.",
      });
    }
    //TMDB does not have songs, use spotify api
    if (!["movie", "tv"].includes(mediaType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media type.",
      });
    }

    // Validate status
    if (!["want", "watching", "watched"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    const watchlistEntry = await WatchList.findOneAndUpdate(
      {
        user: req.user._id,
        tmdbId,
        mediaType,
      },
      {
        status,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    res.status(201).json({
      success: true,
      message: "Added to watchlist.",
      watchlist: watchlistEntry,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

//to get the status of a movie that u are viewing
router.get("/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: "Login required",
      });
    }

    if (isNaN(Number(contentId))) {
      return res.status(400).json({
        message: "Invalid content ID",
      });
    }

    const item = await WatchList.findOne({
      userId: req.user._id,
      tmdbId: Number(contentId),
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
    let tmdbId = Number(req.params.tmdbId);
    // mabe if the cookie expires? then the user is not logged in??
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

module.exports = router;
