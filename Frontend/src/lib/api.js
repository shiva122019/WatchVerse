const demoData = [
  {
    id: 1,
    title: "Interstellar",
    type: "movie",
    avg_rating: 4.8,
    release_year: 2014,
    genres: ["Sci-Fi", "Adventure"],
    description: "A journey through space to save humanity.",
    cover_url: "https://picsum.photos/300/450?random=1",
    backdrop_url: "https://picsum.photos/1200/700?random=1",
  },
  {
    id: 2,
    title: "Dark",
    type: "series",
    avg_rating: 4.7,
    release_year: 2017,
    genres: ["Mystery", "Sci-Fi"],
    description: "A mystery across generations.",
    cover_url: "https://picsum.photos/300/450?random=2",
    backdrop_url: "https://picsum.photos/1200/700?random=2",
  },
  {
    id: 3,
    title: "Blinding Lights",
    type: "song",
    avg_rating: 4.9,
    release_year: 2020,
    genres: ["Pop"],
    description: "Popular song by The Weeknd.",
    cover_url: "https://picsum.photos/300/450?random=3",
    backdrop_url: "https://picsum.photos/1200/700?random=3",
  },
];

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", // your backend URL
  withCredentials: true,
});

export function formatApiError(message) {
  return message || "internal server error";
}

export const API = "http://localhost:5001";

export default api;
