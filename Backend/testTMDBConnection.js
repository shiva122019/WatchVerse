require("dotenv").config();
const axios = require("axios");

console.log("Token present:", !!process.env.TMDB_BEARER_TOKEN);
console.log("Token starts with:", process.env.TMDB_BEARER_TOKEN?.slice(0, 10));

axios
  .get("https://api.themoviedb.org/3/search/multi", {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
    },
    params: { query: "alpha" },
    timeout: 15000,
  })
  .then((res) => {
    console.log("SUCCESS. Results:", res.data.results?.length);
    console.log(res.data.results?.[0]);
  })
  .catch((err) => {
    console.log("FAILED");
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", err.response.data);
    } else {
      console.log("Error code:", err.code);
      console.log("Message:", err.message);
    }
  });