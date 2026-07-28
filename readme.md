# WatchVerse

<<<<<<< HEAD
A modern media discovery platform where users can explore movies and TV series, search for content, manage personal watchlists, and discover trending entertainment. The application integrates with **The Movie Database (TMDB)** to provide up-to-date content and metadata.
=======
WatchVerse is a full-stack MERN media discovery platform that enables users to discover movies and TV series, explore detailed information, write reviews, and manage personalized watchlists. Powered by **The Movie Database (TMDB)**, WatchVerse combines rich media metadata with user-generated content to create a modern entertainment discovery experience.
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03

---

## Features

<<<<<<< HEAD
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
=======
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
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03

---

## Tech Stack

### Frontend

<<<<<<< HEAD
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

=======
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
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03

---

## Project Structure

<<<<<<< HEAD
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
=======
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
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03
│
└── README.md
```

---

## Installation

<<<<<<< HEAD
### Clone the repository

```bash
git clone <repository-url>
cd Movie-app
```

### Backend
=======
### Clone the Repository

```bash
git clone https://github.com/shiva122019/WatchVerse.git
cd WatchVerse
```

---

### Backend Setup
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03

```bash
cd Backend
npm install
```

<<<<<<< HEAD
Create a `.env` file containing:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
TMDB_BEARER_TOKEN=your_tmdb_api_token
=======
Create a `.env` file:

```env
PORT=5000

MONGO_URL=your_mongodb_connection_string

SESSION_SECRET=your_session_secret

TMDB_BEARER_TOKEN=your_tmdb_bearer_token
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03
```

Start the backend:

```bash
npm start
```

<<<<<<< HEAD
---

### Frontend
=======
or

```bash
npm run dev
```

(if using nodemon)

---

### Frontend Setup
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03

```bash
cd Frontend
npm install
npm run dev
```

---

## API Endpoints

### Authentication

<<<<<<< HEAD
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
=======
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
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03

---

## Performance Optimizations

<<<<<<< HEAD
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


=======
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
>>>>>>> f5fee41b22ed47a59471d7a9624ba388f5ac3a03

---

## License

 f5fee41b22ed47a59471d7a9624ba388f5ac3a03
