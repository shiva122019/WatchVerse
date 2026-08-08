const axios = require("axios");
const rax = require("retry-axios");
const https = require("https");

// Reuse TCP/TLS connections instead of opening a new one per request.
// keepAliveMsecs recycles idle sockets before TMDB's server-side idle
// timeout can close them out from under us — this is what was causing
// the ECONNRESET retries.
const keepAliveAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 4000,
  maxSockets: 20,
});

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
  timeout: 10000,
  httpsAgent: keepAliveAgent,
  // retry-axios config attached to every request on this instance
  raxConfig: {
    instance: null, // filled in below after attach
    retry: 3,
    retryDelay: 300,
    backoffType: "linear", // 300 ms, 600 ms, 900 ms
    // Retry only on transient network errors and server errors (not 4xx)
    httpMethodsToRetry: ["GET", "POST", "PUT", "DELETE"],
    statusCodesToRetry: [[500, 599]],
    onRetryAttempt: (err) => {
      const cfg = rax.getConfig(err);
      console.warn(
        `[TMDB] Retry attempt #${cfg.currentRetryAttempt} – ${err.code || err.message}`,
      );
    },
  },
});

// Attach the interceptor and wire the instance back into raxConfig
const interceptorId = rax.attach(tmdb);
tmdb.defaults.raxConfig.instance = tmdb;

module.exports = tmdb;
