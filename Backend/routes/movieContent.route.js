router = require("express").Router();
reviewContent = require("../Models/reviewContent.js");

const {
  getTrailerUrl,
  spotify,
  getSpotifyToken,
  tmdb,
} = require("../services/movieContent.service.js");
const { spotifyGetTrack } = require("../lib/spotify");

router.get("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!["movie", "series", "tv", "song"].includes(type)) {
      return res.status(400).json({
        error: "Invalid content type",
      });
    }

    //--------------------------------------------------
    // Song (Spotify) — uses shared lib/spotify.js
    //--------------------------------------------------

    if (type === "song") {
      const track = await spotifyGetTrack(id);

      // Merge review statistics from the database
      const cache = await reviewContent.findOne({ tmdbId: String(id) });

      const platforms = track.external_url
        ? [
            {
              name: "Spotify",
              url: track.external_url,
              logo: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png",
            },
          ]
        : [];

      return res.json({
        ...track,
        avg_rating: cache?.averageRating ?? track.avg_rating ?? 0,
        review_count: cache?.totalReviews ?? track.review_count ?? 0,
        platforms,
      });
    }

    //--------------------------------------------------
    // Movie / Series (TMDB)
    //--------------------------------------------------

    const endpoint = type === "movie" ? "movie" : "tv";

    const [details, credits, trailerUrl, watchProviders] = await Promise.all([
      tmdb.get(`/${endpoint}/${id}`),
      tmdb.get(`/${endpoint}/${id}/credits`),
      getTrailerUrl(endpoint, id),
      tmdb.get(`/${endpoint}/${id}/watch/providers`),
    ]);

    const item = details.data;

    const crew = credits.data.crew || [];
    const cast = credits.data.cast || [];

    let creator = null;

    if (type === "movie") {
      const director = crew.find((p) => p.job === "Director");

      if (director) {
        creator = {
          id: director.id,
          name: director.name,
          photoUrl: director.profile_path
            ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
            : null,
        };
      }
    } else {
      const showCreator = item.created_by?.[0];

      if (showCreator) {
        creator = {
          id: showCreator.id,
          name: showCreator.name,
          photoUrl: showCreator.profile_path
            ? `https://image.tmdb.org/t/p/w185${showCreator.profile_path}`
            : null,
        };
      }
    }

    // Cached review statistics
    const cache = await reviewContent.findOne({
      tmdbId: String(id),
    });

    // Build the "Available On" list from TMDB watch/providers (region: US)
    const region = watchProviders.data.results?.US;

    let platforms = [];

    if (region) {
      const combined = [
        ...(region.flatrate || []),
        ...(region.free || []),
        ...(region.ads || []),
      ];

      const seen = new Set();

      platforms = combined
        .filter((p) => {
          if (seen.has(p.provider_id)) return false;
          seen.add(p.provider_id);
          return true;
        })
        .map((p) => ({
          name: p.provider_name,
          logo: p.logo_path
            ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
            : null,
          // TMDB doesn't give a deep link per-provider, only one link to
          // its own watch page listing all of them
          url: region.link,
        }));
    }

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

      trailer_url: trailerUrl,

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

      cast: cast.slice(0, 10).map((person) => ({
        id: person.id,
        name: person.name,
        character: person.character,
        photoUrl: person.profile_path
          ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
          : null,
      })),

      avg_rating: cache?.averageRating ?? 0,

      review_count: cache?.totalReviews ?? 0,

      platforms,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch content",
    });
  }
});

module.exports = router;
