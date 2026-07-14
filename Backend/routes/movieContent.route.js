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

router.get("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!["movie", "series", "tv"].includes(type)) {
      return res.status(400).json({
        error: "Invalid content type",
      });
    }

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
