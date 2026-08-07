const axios = require("axios");
const rax = require("retry-axios");

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
  timeout: 5000,
});

tmdb.defaults.raxConfig = {
  retry: 1,
  backoffType: "exponential",
  retryDelay: 100,
  onRetryAttempt: (err) => {
    console.error(`[TMDB] Retry attempt #${err.config?.raxConfig?.currentRetryAttempt} — ${err.code}`);
  }
};

rax.attach(tmdb);

module.exports = tmdb;
