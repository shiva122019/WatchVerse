# WatchVerse

A modern media discovery platform where users can explore movies and TV series, search for content, manage personal watchlists, and discover trending entertainment. The application integrates with **The Movie Database (TMDB)** to provide up-to-date content and metadata.

---

## Features

### User Authentication

* Secure user registration and login
* Password hashing with bcrypt
* Session-based authentication using Passport.js
* Persistent login sessions

### Browse Content

* Browse trending movies and TV series
* Filter by media type
* Filter by genre
* Search by title
* Search by actor or creator
* Responsive browsing interface

### Home Page

* Featured media banner
* Trending content
* Popular movies
* Popular TV series
* Curated content sections

### Watchlist

* Add content to a personal watchlist
* Track watching status:

  * Want to Watch
  * Watching
  * Watched
* Remove items from the watchlist

### Media Details

* Movie and TV metadata
* Release year
* Ratings
* Genres
* Posters and backdrop images
* Descriptions

---

## Tech Stack

### Frontend

* React
* React Router
* Axios
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Passport.js
* Express Session
* bcrypt

### External APIs

* TMDB API


---

## Project Structure

```
Movie-app/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── Backend/
│   ├── Models/
│   ├── Routes/
│   ├── Config/
│   ├── Lib/
│   └── ...
│
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd Movie-app
```

### Backend

```bash
cd Backend
npm install
```

Create a `.env` file containing:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
TMDB_BEARER_TOKEN=your_tmdb_api_token
```

Start the backend:

```bash
npm start
```

---

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

## API Endpoints

### Authentication

* `POST /register`
* `POST /login`
* `POST /logout`
* `GET /currentUser`

### Content

* `GET /home`
* `GET /queryContent`

### Watchlist

* `POST /watchlist/add`
* `GET /watchlist`
* `PATCH /watchlist/:id`
* `DELETE /watchlist/:id`

---

## Performance Optimizations

* Cached homepage data to reduce API calls
* Cached genre lists for 24 hours
* Cached trending and discover results
* Automatic retry for failed TMDB requests
* Connection reuse using HTTP Keep-Alive
* Duplicate removal from aggregated search results

---

## Future Improvements

* User reviews and ratings
* AI-powered recommendations
* Recommendation engine based on watch history
* Friend system and social activity feed
* Shared watch rooms
* Infinite scrolling
* Notifications
* Dark mode customization
* Spotify integration for music
* Review sentiment analysis using AI

---



---

## License

This project is intended for educational and portfolio purposes.
