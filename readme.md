# WatchVerse

WatchVerse is a full-stack MERN media discovery platform that enables users to discover movies and TV series, explore detailed information, write reviews, and manage personalized watchlists. Powered by **The Movie Database (TMDB)**, WatchVerse combines rich media metadata with user-generated content to create a modern entertainment discovery experience.

---

## Features

### Authentication

- User registration and login
- Secure password hashing using bcrypt
- Session-based authentication with Passport.js
- Persistent login sessions using Express Session and MongoDB

---

### Home Page

Browse curated collections including:

- Featured movie banner
- Trending movies
- Popular movies
- Top-rated movies
- Popular TV series
- Top-rated TV series

Content is presented in horizontally scrollable sections inspired by modern streaming platforms.

---

### Browse & Search

Discover new content using powerful search and filtering features.

- Browse movies and TV series
- Search by title
- Search by actor or creator
- Filter by genre
- Filter by media type
- Trending content
- Discover content by genre
- Duplicate result removal
- Results sorted by rating

---

### Content Detail Page

Each movie or TV series has a dedicated detail page containing:

- High-resolution poster and backdrop
- Description
- Genres
- Release year
- Runtime or number of seasons
- Director or creator
- Main cast
- Average community rating
- Review count

---

### User Reviews

Users can contribute their own reviews and ratings.

Features include:

- 1–5 star ratings
- Written reviews
- One review per user per title
- Community average rating
- Cached review statistics for fast retrieval
- Reviews displayed in reverse chronological order

---

### Personal Watchlist

Organize entertainment into custom watch states.

Supported statuses:

- Want to Watch
- Watching
- Watched

Users can:

- Add content
- Update watch status
- Remove content
- View all saved titles

---

## Tech Stack

### Frontend

- React (Vite)
- React Router
- Tailwind CSS
- Framer Motion
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js (Local Strategy)
- express-session
- connect-mongo
- bcrypt
- Axios
- retry-axios
- NodeCache

### External APIs

- TMDB (The Movie Database)

---

## Project Structure

```text
WatchVerse/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── ...
│   │
│   └── public/
│
├── Backend/
│   ├── Models/
│   │   ├── User.js
│   │   ├── WatchList.js
│   │   ├── Review.js
│   │   └── reviewContent.js
│   │
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── home.route.js
│   │   ├── movieContent.route.js
│   │   ├── reviews.route.js
│   │   ├── watchlist.route.js
│   │   └── index.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   │
│   ├── lib/
│   │   └── errorHandler.js
│   │
│   └── server.js
│
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/shiva122019/WatchVerse.git
cd WatchVerse
```

---

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URL=your_mongodb_connection_string

SESSION_SECRET=your_session_secret

TMDB_BEARER_TOKEN=your_tmdb_bearer_token
```

Start the backend:

```bash
npm start
```

or

```bash
npm run dev
```

(if using nodemon)

---

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

## API Endpoints

### Authentication

| Method | Endpoint       | Description                    |
| ------ | -------------- | ------------------------------ |
| POST   | `/register`    | Register a new user            |
| POST   | `/login`       | Authenticate user              |
| POST   | `/logout`      | Log out                        |
| GET    | `/currentUser` | Get current authenticated user |

---

### Content

| Method | Endpoint             | Description                                   |
| ------ | -------------------- | --------------------------------------------- |
| GET    | `/home`              | Homepage content                              |
| GET    | `/queryContent`      | Browse and search media                       |
| GET    | `/content/:type/:id` | Detailed information for a movie or TV series |

---

### Reviews

| Method | Endpoint   | Description                  |
| ------ | ---------- | ---------------------------- |
| GET    | `/reviews` | Retrieve reviews for a title |
| POST   | `/reviews` | Submit a review              |

---

### Watchlist

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| POST   | `/watchlist`            | Add or update watchlist status |
| GET    | `/watchlist/content`    | Retrieve user's watchlist      |
| GET    | `/watchlist/:contentId` | Get watch status for a title   |
| DELETE | `/watchlist/:contentId` | Remove from watchlist          |

---

## Performance Optimizations

- Shared Axios client for TMDB requests
- Automatic retry using retry-axios with exponential backoff
- NodeCache integration
- 15-minute homepage cache
- 15-minute browse cache
- 24-hour genre cache
- Duplicate search result removal
- Cached review statistics
- Shared TMDB response mapping
- Session-based authentication
- Optimized average rating updates in **O(1)** time

---

## Current Project Status

Implemented:

- Authentication
- Home page
- Browse page
- Content detail page
- Reviews and ratings
- Watchlist
- TMDB integration
- Session management
- Response caching
- Retry logic
- Responsive frontend

---

## Planned Features

- User profiles
- Profile pictures
- Review editing and deletion
- Personalized recommendations
- Friends and social features
- AI-generated review summaries
- AI-powered recommendation engine
- Shared watch rooms
- Notification system
- Infinite scrolling
- Spotify integration
- Dark mode
- Deployment and CI/CD

---

## License

This project is intended for educational purposes, portfolio development, and software engineering interviews.
