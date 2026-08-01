const axios = require("axios");

const headers = {
  Authorization: `Bearer YOUR_TMDB_BEARER_TOKEN`,
  accept: "application/json",
};

axios
  .get("https://api.themoviedb.org/3/search/multi?query=naruto", {
    headers,
    timeout: 10000,
  })
  .then((res) => {
    console.log("Success:", res.status);
    console.log(res.data.results[0]);
  })
  .catch((err) => {
    console.log("Code:", err.code);
    console.log("Message:", err.message);
  });