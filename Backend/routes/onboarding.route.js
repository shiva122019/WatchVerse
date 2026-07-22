const router = require("express").Router();
const NodeCache = require("node-cache");

const tmdb = require("../lib/tmdb");
const User = require("../Models/User");
const UserPreference = require("../Models/UserPreference");

router.get("/content", async (req, res, next) => {
  try {
    const requests = [
      tmdb.get("/trending/movie/week"),
      tmdb.get("/movie/popular"),
      tmdb.get("/movie/top_rated"),
      tmdb.get("/movie/now_playing"),
      tmdb.get("/movie/upcoming"),

      tmdb.get("/trending/tv/week"),
      tmdb.get("/tv/popular"),
      tmdb.get("/tv/top_rated"),
      tmdb.get("/tv/on_the_air"),
    ];

    const responses = await Promise.all(requests);

    const unique = new Map();

    responses.forEach((response, index) => {
      const isMovie = index < 5;

      response.data.results.forEach((item) => {
        const key = `${isMovie ? "movie" : "tv"}-${item.id}`;

        if (!unique.has(key)) {
          unique.set(key, {
            id: item.id,
            mediaType: isMovie ? "movie" : "tv",

            title: isMovie ? item.title : item.name,

            overview: item.overview,

            poster: item.poster_path,

            backdrop: item.backdrop_path,

            rating: item.vote_average,

            releaseDate: isMovie ? item.release_date : item.first_air_date,
          });
        }
      });
    });

    const content = Array.from(unique.values());

    content.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      content: content.slice(0, 30),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/status", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.json({
      success: true,
      onboardingCompleted: req.user.onboardingCompleted,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/preferences", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { liked = [], disliked = [] } = req.body;

    const genreMap = new Map();
    const actorMap = new Map();

    async function processItem(item, weight) {
      const detailsEndpoint =
        item.mediaType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;

      const creditsEndpoint =
        item.mediaType === "tv"
          ? `/tv/${item.id}/credits`
          : `/movie/${item.id}/credits`;

      const [detailsRes, creditsRes] = await Promise.all([
        tmdb.get(detailsEndpoint),
        tmdb.get(creditsEndpoint),
      ]);

      const details = detailsRes.data;
      const credits = creditsRes.data;

      details.genres.forEach((genre) => {
        if (!genreMap.has(genre.id)) {
          genreMap.set(genre.id, {
            genreId: genre.id,
            genreName: genre.name,
            score: 0,
          });
        }

        genreMap.get(genre.id).score += weight;
      });

      credits.cast.slice(0, 5).forEach((actor) => {
        if (!actorMap.has(actor.id)) {
          actorMap.set(actor.id, {
            actorId: actor.id,
            actorName: actor.name,
            score: 0,
          });
        }

        actorMap.get(actor.id).score += weight;
      });
    }

    await Promise.all([
      ...liked.map((item) => processItem(item, 1)),
      ...disliked.map((item) => processItem(item, -1)),
    ]);

    await UserPreference.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,

        genrePreferences: Array.from(genreMap.values()).sort(
          (a, b) => b.score - a.score,
        ),

        actorPreferences: Array.from(actorMap.values()).sort(
          (a, b) => b.score - a.score,
        ),

        onboardingCompleted: true,
      },
      {
        new: true,
        upsert: true,
      },
    );

    await User.findByIdAndUpdate(req.user._id, {
      onboardingCompleted: true,
    });

    res.json({
      success: true,
      message: "Preferences saved successfully.",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
