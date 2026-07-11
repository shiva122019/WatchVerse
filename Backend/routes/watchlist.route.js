const router = require("express").Router();
const User = require("../Models/User.js");
const WatchList = require("../Models/WatchList.js");

router.post("/add", async (req, res) => {
  try {
    if (!req.session.userId) {
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

    // Check for duplicate
    const existing = await Watchlist.findOne({
      user: req.session.userId,
      tmdbId,
      mediaType,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This item is already in your watchlist.",
      });
    }

    const watchlistEntry = await Watchlist.create({
      user: req.session.userId,
      tmdbId,
      mediaType,
      status,
    });

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

router.get("/content", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in.",
      });
    }

    const watchlist = await Watchlist.find({
      user: req.session.userId,
    });

    const response = await Promise.all(
      watchlist.map(async (entry) => {
        const url = `https://api.themoviedb.org/3/${entry.mediaType}/${entry.tmdbId}`;

        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
          },
        };

        const tmdbResponse = await fetch(url, options);

        if (!tmdbResponse.ok) {
          throw new Error(`TMDB request failed: ${tmdbResponse.status}`);
        }

        const movie = await tmdbResponse.json();

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

            cover_url: IMAGE_BASE + movie.poster_path,

            backdrop_url: IMAGE_BASE + movie.backdrop_path,
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

router.delete("/content/:tmdbid", async (req, res) => {
  //   let data = [
  //     {
  //       id: 1,
  //       title: "Interstellar",
  //       type: "movie",
  //       avg_rating: 4.8,
  //       release_year: 2014,
  //       genres: ["Sci-Fi", "Adventure"],
  //       description: "A journey through space to save humanity.",
  //       cover_url: "https://picsum.photos/300/450?random=1",
  //       backdrop_url: "https://picsum.photos/1200/700?random=1",
  //     },
  //     {
  //       id: 2,
  //       title: "Dark",
  //       type: "series",
  //       avg_rating: 4.7,
  //       release_year: 2017,
  //       genres: ["Mystery", "Sci-Fi"],
  //       description: "A mystery across generations.",
  //       cover_url: "https://picsum.photos/300/450?random=2",
  //       backdrop_url: "https://picsum.photos/1200/700?random=2",
  //     },
  //     {
  //       id: 3,
  //       title: "Blinding Lights",
  //       type: "song",
  //       avg_rating: 4.9,
  //       release_year: 2020,
  //       genres: ["Pop"],
  //       description: "Popular song by The Weeknd.",
  //       cover_url: "https://picsum.photos/300/450?random=3",
  //       backdrop_url: "https://picsum.photos/1200/700?random=3",
  //     },
  //   ];

  try {
    // mabe if the cookie expires? then the user is not logged in??
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first.",
      });
    }

    const deletedMovie = await Watchlist.findOneAndDelete({
      user: req.session.userId,
      tmdbId: Number(req.params.tmdbId),
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

router.get("/test", async (req, res) => {
  const endpoints = [
    "/trending/all/week",
    "/movie/popular",
    "/movie/top_rated",
    "/tv/popular",
    "/tv/top_rated",
    "/genre/movie/list",
    "/genre/tv/list",
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(process.env.TMDB_BEARER_TOKEN);
      const response = await axios.get(
        `https://api.themoviedb.org/3${endpoint}`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
          },
          timeout: 10000,
        },
      );

      results.push({
        endpoint,
        success: true,
        status: response.status,
      });
    } catch (err) {
      results.push({
        endpoint,
        success: false,
        error: err.code,
        message: err.message,
        status: err.response?.status,
      });
    }
  }

  res.json(results);
});

module.exports = router;
