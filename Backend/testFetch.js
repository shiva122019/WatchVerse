require("dotenv").config();

async function test() {
  const res = await fetch(
    "https://api.themoviedb.org/3/search/multi?query=Interstellar",
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        accept: "application/json",
      },
    }
  );

  const data = await res.json();

  console.log(data.results[0]);
}

test();