// Mock data for the public profile page.
// Structure mirrors the shape expected from GET /profile/me so swapping
// in real API data later is a drop-in replacement — see Profile.jsx notes.

export const mockProfile = {
  id: "usr_8231",
  displayName: "Ava Marlowe",
  username: "avamarlowe",
  role: "creator", // "creator" | "member" — gates Creator Dashboard, Posts tab
  verified: true,
  bio: "Cinematography nerd. I rank every Denis Villeneuve shot by lighting alone. Currently mainlining 90s sci-fi.",
  location: "Portland, OR",
  website: "avamarlowe.dev",
  joinDate: "2021-03-14",
  bannerUrl: null, // null -> gradient placeholder
  avatarUrl: null, // null -> initials placeholder

  stats: {
    moviesWatched: 1284,
    showsWatched: 96,
    reviews: 342,
    followers: 12800,
    following: 214,
  },

  spotify: {
    connected: true,
    username: "ava.marlowe",
    followers: 843,
    topArtists: [
      "Hans Zimmer",
      "Boards of Canada",
      "Ludwig Göransson",
      "Sigur Rós",
    ],
    topGenres: ["Film Score", "Ambient", "Post-Rock", "Synthwave"],
  },

  recentActivity: [
    {
      id: 1,
      type: "rating",
      title: "Interstellar",
      rating: 5,
      timestamp: "2026-08-03T18:20:00Z",
    },
    {
      id: 2,
      type: "watchlist",
      title: "Oppenheimer",
      timestamp: "2026-08-02T09:10:00Z",
    },
    {
      id: 3,
      type: "review",
      title: "Arcane",
      timestamp: "2026-07-30T21:45:00Z",
    },
  ],

  favoriteMovies: [
    { id: "m1", title: "Interstellar", year: 2014, posterUrl: null, rating: 5 },
    {
      id: "m2",
      title: "Blade Runner 2049",
      year: 2017,
      posterUrl: null,
      rating: 5,
    },
    {
      id: "m3",
      title: "The Prestige",
      year: 2006,
      posterUrl: null,
      rating: 4.5,
    },
    { id: "m4", title: "Arrival", year: 2016, posterUrl: null, rating: 5 },
    { id: "m5", title: "Whiplash", year: 2014, posterUrl: null, rating: 4.5 },
    { id: "m6", title: "Her", year: 2013, posterUrl: null, rating: 4 },
  ],

  favoriteShows: [
    { id: "s1", title: "Breaking Bad", year: 2008, posterUrl: null, rating: 5 },
    { id: "s2", title: "Chernobyl", year: 2019, posterUrl: null, rating: 5 },
    { id: "s3", title: "Arcane", year: 2021, posterUrl: null, rating: 5 },
    { id: "s4", title: "The Bear", year: 2022, posterUrl: null, rating: 4.5 },
    { id: "s5", title: "Fargo", year: 2014, posterUrl: null, rating: 4 },
  ],

  favoriteActors: [
    { id: "a1", name: "Denzel Washington", photoUrl: null },
    { id: "a2", name: "Cate Blanchett", photoUrl: null },
    { id: "a3", name: "Oscar Isaac", photoUrl: null },
    { id: "a4", name: "Florence Pugh", photoUrl: null },
  ],

  favoriteDirectors: [
    { id: "d1", name: "Denis Villeneuve", photoUrl: null },
    { id: "d2", name: "Christopher Nolan", photoUrl: null },
    { id: "d3", name: "Bong Joon-ho", photoUrl: null },
    { id: "d4", name: "Greta Gerwig", photoUrl: null },
  ],

  recentReviews: [
    {
      id: "r1",
      title: "Arcane",
      posterUrl: null,
      rating: 5,
      body: "Every frame is a painting. Season 2 stuck the landing in a way I didn't think was possible for a game adaptation.",
      date: "2026-07-30T21:45:00Z",
    },
    {
      id: "r2",
      title: "Dune: Part Two",
      posterUrl: null,
      rating: 4.5,
      body: "Villeneuve understands scale better than almost anyone working right now. The sandworm sequence alone is worth the ticket.",
      date: "2026-07-18T14:05:00Z",
    },
    {
      id: "r3",
      title: "The Bear",
      posterUrl: null,
      rating: 4,
      body: "Stressful in the best way. Season 3 slows down but the craft is still there in every kitchen scene.",
      date: "2026-07-02T11:30:00Z",
    },
  ],

  allReviews: [
    {
      id: "r1",
      title: "Arcane",
      posterUrl: null,
      rating: 5,
      body: "Every frame is a painting.",
      date: "2026-07-30T21:45:00Z",
    },
    {
      id: "r2",
      title: "Dune: Part Two",
      posterUrl: null,
      rating: 4.5,
      body: "Scale like nobody else working right now.",
      date: "2026-07-18T14:05:00Z",
    },
    {
      id: "r3",
      title: "The Bear",
      posterUrl: null,
      rating: 4,
      body: "Stressful in the best way.",
      date: "2026-07-02T11:30:00Z",
    },
    {
      id: "r4",
      title: "Poor Things",
      posterUrl: null,
      rating: 4.5,
      body: "Unhinged in the way great satire should be.",
      date: "2026-06-20T09:15:00Z",
    },
    {
      id: "r5",
      title: "Oppenheimer",
      posterUrl: null,
      rating: 5,
      body: "The sound design alone deserves an award.",
      date: "2026-06-05T20:00:00Z",
    },
    {
      id: "r6",
      title: "True Detective",
      posterUrl: null,
      rating: 3.5,
      body: "Inconsistent but the atmosphere carries it.",
      date: "2026-05-22T17:40:00Z",
    },
  ],

  watchlist: {
    wantToWatch: [
      { id: "w1", title: "Civil War", year: 2024, posterUrl: null },
      { id: "w2", title: "Shogun", year: 2024, posterUrl: null },
    ],
    watching: [{ id: "w3", title: "Fallout", year: 2024, posterUrl: null }],
    watched: [
      { id: "w4", title: "Interstellar", year: 2014, posterUrl: null },
      { id: "w5", title: "Arcane", year: 2021, posterUrl: null },
      { id: "w6", title: "Oppenheimer", year: 2023, posterUrl: null },
    ],
  },

  activityTimeline: [
    {
      id: "t1",
      label: "Yesterday",
      entries: [{ id: "t1a", text: "Rated Dune", rating: 5 }],
    },
    {
      id: "t2",
      label: "2 days ago",
      entries: [{ id: "t2a", text: "Added Breaking Bad to watchlist" }],
    },
    {
      id: "t3",
      label: "5 days ago",
      entries: [{ id: "t3a", text: "Liked a review of Poor Things" }],
    },
    {
      id: "t4",
      label: "1 week ago",
      entries: [{ id: "t4a", text: "Reviewed The Bear", rating: 4 }],
    },
  ],

  creatorPosts: {
    trailers: [
      {
        id: "p1",
        title: "Dune: Part Three — Teaser Breakdown",
        thumbUrl: null,
        date: "2026-08-01T12:00:00Z",
      },
      {
        id: "p2",
        title: "Everything Wrong With That Ending",
        thumbUrl: null,
        date: "2026-07-25T12:00:00Z",
      },
    ],
    announcements: [
      {
        id: "p3",
        title: "Starting a weekly sci-fi watch club",
        date: "2026-07-28T10:00:00Z",
      },
    ],
    latestReleases: [
      {
        id: "p4",
        title: "Ranking Every A24 Horror Film",
        thumbUrl: null,
        date: "2026-07-15T10:00:00Z",
      },
    ],
  },
};
