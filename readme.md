# WatchVerse

WatchVerse is a full-stack MERN media discovery platform that enables users to discover movies and TV series, explore detailed information, write reviews, manage personalized watchlists, discover music, interact with AI, and connect with other users. Powered by **The Movie Database (TMDB)**, WatchVerse combines rich media metadata with personalized and social entertainment features.

---

## Features

### User Authentication

- Secure user registration and login
- Password hashing with bcrypt
- Session-based authentication using Passport.js
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
- Curated content sections

Content is presented in horizontally scrollable sections inspired by modern streaming platforms.

---

### Browse & Search

Discover new content using search and filtering features.

- Browse movies and TV series
- Search by title
- Search by actor or creator
- Filter by genre
- Filter by media type
- Discover trending content
- Discover content by genre
- Duplicate result removal
- Results sorted by rating
- Infinite scrolling for continuous discovery

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
- User reviews
- Watchlist functionality

---

### User Reviews & Ratings

Users can contribute their own reviews and ratings.

Features include:

- 1–5 star ratings
- Written reviews
- One review per user per title
- Community average rating
- Cached review statistics
- Reviews displayed in reverse chronological order
- Comments on reviews

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
- Manage their personal watchlist

---

### Swipe-Based Discovery

WatchVerse provides a Tinder-style content discovery experience.

Users can swipe through movie and TV series cards to quickly discover content.

Features include:

- Interactive swipe cards
- Swipe-based content discovery
- Quick content decisions
- Personalized discovery experience
- Smooth card animations

---

### AI Entertainment Chatbot

WatchVerse includes an AI-powered chatbot that helps users discover movies, TV series, and other entertainment content.

Users can ask natural-language questions such as:

- Recommend some thriller movies
- What should I watch if I liked Interstellar?
- Suggest some good comedy series
- Recommend movies similar to Inception

The AI assistant helps users discover content through conversational interaction.

---

### Chat Rooms

WatchVerse includes chat rooms that allow users to interact and discuss entertainment.

Users can:

- Join entertainment discussions
- Discuss movies and TV series
- Share recommendations
- Exchange opinions
- Interact with other users
- Participate in community discussions

---

### Music Discovery

WatchVerse also includes music discovery functionality through Spotify integration.

Users can explore:

- Songs
- Artists
- Albums
- Music recommendations
- Spotify content

This extends WatchVerse beyond movies and TV series into a broader entertainment discovery platform.

---

### User Preferences & Personalization

WatchVerse supports user preferences to provide a more personalized entertainment experience.

User preferences can be used for:

- Genre preferences
- Entertainment interests
- Personalized discovery
- Recommendation-related features
- User-specific content preferences

---

### Infinite Scrolling

WatchVerse uses infinite scrolling to provide continuous content discovery.

Instead of navigating through multiple pages, users can keep scrolling to load additional movies and TV series.

Benefits include:

- Continuous discovery
- Smoother browsing
- Reduced page navigation
- Better exploration experience

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Framer Motion

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- Express Session
- connect-mongo
- bcrypt
- NodeCache
- retry-axios

### External APIs

- TMDB (The Movie Database)
- Spotify API
- Gemini API

---

## Project Structure

```text
WatchVerse/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedOrb.jsx
│   │   │   ├── MediaAssistantChatbot.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ReviewComments.jsx
│   │   │   ├── SwipeCard.jsx
│   │   │   └── SwipeStack.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Browser.jsx
│   │   │   ├── Detail.jsx
│   │   │   ├── Register.jsx
│   │   │   └── onBoarding.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   └── public/
│
├── Backend/
│   ├── Models/
│   │   ├── Comment.js
│   │   ├── Review.js
│   │   ├── User.js
│   │   ├── UserPreference.js
│   │   └── reviewContent.js
│   │
│   ├── controllers/
│   │   └── chat.controller.js
│   │
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── chat.route.js
│   │   ├── comments.route.js
│   │   ├── home.route.js
│   │   ├── onboarding.route.js
│   │   ├── watchlist.route.js
│   │   └── index.js
│   │
│   ├── services/
│   │   ├── gemini.service.js
│   │   ├── home.service.js
│   │   ├── intent.service.js
│   │   ├── mediaClassifier.service.js
│   │   ├── prompt.service.js
│   │   ├── spotify.service.js
│   │   └── tmdb.service.js
│   │
│   ├── config/
│   ├── lib/
│   └── server.js
│
├── package.json
├── package-lock.json
└── README.md