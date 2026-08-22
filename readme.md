<div align="center">

<!-- Animated typing header using capsule-render -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00F0FF,50:8E75F7,100:FF0055&height=220&section=header&text=🎬%20WatchVerse&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Where%20Entertainment%20Meets%20Community&descSize=20&descAlignY=55&descColor=ffffff" width="100%"/>

<br/>

<!-- Animated typing effect -->
<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=00F0FF&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=%F0%9F%8E%AC+Stream+%E2%80%A2+%F0%9F%8E%B5+Listen+%E2%80%A2+%F0%9F%8E%A4+Sing+%E2%80%A2+%F0%9F%91%A5+Connect;AI+Chatbot+%E2%80%A2+Watch+Parties+%E2%80%A2+Karaoke+%E2%80%A2+Creator+Studio" alt="Typing SVG" /></a>

<br/><br/>

<!-- Tech stack badges -->
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

<br/>

[![TMDB](https://img.shields.io/badge/TMDB_API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
[![Spotify](https://img.shields.io/badge/Spotify_API-1DB954?style=for-the-badge&logo=spotify&logoColor=white)](https://developer.spotify.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-8E75F7?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/identity)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

<br/><br/>

<!-- Dynamic stats -->
![GitHub repo size](https://img.shields.io/github/repo-size/shiva122019/WatchVerse?style=flat-square&color=00F0FF&label=Repo%20Size)
![GitHub last commit](https://img.shields.io/github/last-commit/shiva122019/WatchVerse?style=flat-square&color=8E75F7&label=Last%20Commit)
![GitHub stars](https://img.shields.io/github/stars/shiva122019/WatchVerse?style=flat-square&color=FFB300&label=Stars)

</div>

<br/>

---

<div align="center">

## 🌌 What is WatchVerse?

</div>

> **WatchVerse** is a next-generation **full-stack MERN entertainment ecosystem** that merges movie/TV discovery, music streaming, AI-powered recommendations, real-time social features, and creator tools into one cinematic experience.

It's not just another streaming site — it's a **living, breathing community** where you can discover content through AI conversations, watch movies together in synchronized rooms, sing karaoke with your friends, create posts as a content creator, and build your entertainment identity.

<div align="center">

```
🎬 Discover  →  🤖 AI Recommends  →  👥 Watch Together  →  ⭐ Review  →  🎤 Sing Along  →  📝 Create
```

</div>

---

## 🗺️ Table of Contents

<details>
<summary>📖 Click to expand</summary>

- [What is WatchVerse?](#-what-is-watchverse)
- [Feature Highlights](#-feature-highlights)
- [Feature Deep Dive](#-feature-deep-dive)
- [System Architecture](#-system-architecture)
- [Data Model](#-data-model)
- [AI Chatbot Pipeline](#-ai-chatbot-pipeline)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [Team](#-team)

</details>

---

## ⚡ Feature Highlights

<div align="center">

| Feature | Description | Tech |
|:---:|:---|:---:|
| 🏠 **Dynamic Home** | Hero banners, trending rows, genre collections with infinite scroll | React + TMDB |
| 🔐 **Google OAuth** | One-click sign-in with Google, session persistence | Passport.js |
| 🎵 **Spotify Integration** | Link Spotify → Get movie recs based on your music taste | Spotify Web API |
| 🤖 **AI Chatbot** | Natural language: *"Find me a thriller like Inception"* | Gemini AI |
| 🎉 **Watch Parties** | Create rooms, invite friends, sync video playback in real-time | Socket.IO |
| 🎤 **Karaoke Studio** | Sing along with synced lyrics, record & share vocal covers | Web Audio API |
| 📝 **Creator Hub** | Write posts, build following, creator analytics dashboard | MongoDB + Cloudinary |
| ⭐ **Reviews & Ratings** | 1-5 star ratings, threaded comments, community averages | MongoDB |
| 📋 **Smart Watchlist** | Track: *Want to Watch* → *Watching* → *Watched* | MongoDB |
| 👤 **Rich Profiles** | Activity feed, favorites, stats, follower system | Aggregation Pipeline |
| 🔍 **Advanced Filters** | Filter by genre, year, rating, type with real-time results | TMDB + Custom |
| 🃏 **Swipe Discovery** | Tinder-style swipe cards for quick content decisions | Framer Motion |

</div>

---

## 🎯 Feature Deep Dive

<details>
<summary><b>🏠 Dynamic Homepage</b></summary>
<br/>

The homepage is a cinematic experience inspired by premium streaming platforms:

- **🎬 Hero Banner** — Features a highlighted movie/show with backdrop, rating, and quick-action buttons
- **📊 Top 10 Trending** — Real-time trending content with numbered ranking badges
- **🎯 Recommended For You** — Personalized suggestions based on watch history and preferences
- **🎵 Spotify Mood Row** — Movies that match the vibe of your recent Spotify listens
- **📂 Genre Collections** — Action, Comedy, Drama, Sci-Fi, Horror, and more
- **♾️ Infinite Scroll** — Seamless pagination that loads more content as you scroll
- **💀 Skeleton Loading** — Beautiful shimmer animations while content loads

</details>

<details>
<summary><b>🔐 Authentication & Onboarding</b></summary>
<br/>

- **Google OAuth 2.0** — Secure, one-click Google sign-in via Passport.js
- **Local Auth** — Traditional email/password registration with bcrypt hashing
- **Session Management** — Persistent sessions stored in MongoDB via connect-mongo
- **Smart Onboarding** — New users pick favorite genres and interests to seed recommendations
- **Protected Routes** — Automatic redirects for unauthenticated users

</details>

<details>
<summary><b>🎵 Spotify Integration</b></summary>
<br/>

WatchVerse bridges the gap between music and movies:

```
🎧 Your Spotify → 🧠 Mood Analysis → 🎬 Movie Recommendations
```

- **OAuth Flow** — Connect/disconnect Spotify with a single click
- **Listening Analysis** — Analyzes your top tracks, artists, and audio features
- **Cross-Media Recs** — If you listen to dark, atmospheric music → get thriller/noir movie suggestions
- **Music Row** — Dedicated "Songs for your mood" row on the homepage
- **Profile Integration** — Your Spotify connection status visible on your profile

</details>

<details>
<summary><b>🤖 AI Media Assistant Chatbot</b></summary>
<br/>

A conversational AI that understands entertainment like a film-buff friend:

- **Natural Language** — Ask anything: *"What's a good movie for date night?"*
- **Intent Classification** — Automatically detects if you want recommendations, cast info, ratings, or storylines
- **Contextual Memory** — Remembers conversation context within a session
- **Rich Cards** — Returns interactive movie/show cards with posters, ratings, and direct links
- **Library Sync** — Optionally syncs your watchlist so it knows what you've already seen
- **Animated UI** — Features a glowing animated orb that pulses while thinking

</details>

<details>
<summary><b>🎉 Watch Parties & Watch Rooms</b></summary>
<br/>

Watch movies together, no matter where you are:

- **Create Rooms** — Generate a unique room with a shareable link
- **Synchronized Playback** — Play/pause/seek syncs across all viewers in real-time
- **Live Chat** — Built-in real-time chat sidebar powered by Socket.IO
- **Participant Tracking** — See who's in the room with live avatars
- **Immersive Mode** — Full-screen experience with hidden navbar for cinematic viewing

</details>

<details>
<summary><b>🎤 Karaoke Studio</b></summary>
<br/>

A full-featured karaoke experience built right into the platform:

- **🎵 Synced Lyrics** — Real-time scrolling and highlighting of lyrics (including transliterated/Romanized for Hindi tracks)
- **🎶 Auto-Play Backing Music** — HTML5 audio player + YouTube video integration
- **📊 Voice Visualizer** — Canvas-based real-time frequency visualization using Web Audio API
- **🎙️ Recording** — Record your vocals using the browser's MediaRecorder API
- **🎚️ Vocal Mixer** — Automatically mix your recorded voice with the backing track
- **☁️ Community Submissions** — Save covers to Cloudinary and share in the Community Recordings gallery

</details>

<details>
<summary><b>📝 Creator Hub & Studio</b></summary>
<br/>

Turn consumers into creators:

- **Creator Studio** — Rich text editor for writing posts about movies, series, and music
- **Media Attachments** — Upload images via Cloudinary integration
- **Creator Feed** — Scrollable feed of all creator posts with engagement metrics
- **Analytics Dashboard** — Track views, likes, and engagement on your posts
- **Follow System** — Follow creators and see their content in your feed
- **Comments & Discussions** — Threaded comment system on every post

</details>

<details>
<summary><b>👤 Profiles & Social</b></summary>
<br/>

Your entertainment identity:

- **Profile Page** — Avatar, display name, stats banner, and activity feed
- **Favorites Collection** — Curated list of favorite movies, shows, and songs
- **Review History** — All your reviews and ratings in one place
- **Follower/Following** — Social graph with follow/unfollow functionality
- **Activity Stats** — Reviews written, watchlist items, favorites count
- **Public Profiles** — Click any username anywhere to view their profile

</details>

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["🖥️ Frontend — React 19 + Vite"]
        direction TB
        UI["🎨 Pages & Components"]
        Context["🔗 AuthContext + API Layer"]
        Realtime["⚡ Socket.IO Client"]
        UI --> Context
        UI --> Realtime
    end

    subgraph Server["⚙️ Backend — Node.js + Express 5"]
        direction TB
        Routes["🛣️ API Routes<br/>18 route files"]
        Auth["🔐 Passport.js<br/>Google OAuth + Local"]
        Controllers["🎮 Controllers"]
        Services["📦 Service Layer<br/>15 service files"]
        Cache[("⚡ NodeCache")]
        SocketServer["🔌 Socket.IO Server"]
    end

    subgraph Data["🗄️ Data Layer"]
        Mongo[("🍃 MongoDB Atlas<br/>12 Collections")]
        Sessions[("🔑 Session Store<br/>connect-mongo")]
        Cloud[("☁️ Cloudinary<br/>Media Storage")]
    end

    subgraph External["🌐 External APIs"]
        TMDB[("🎬 TMDB API<br/>Movies & TV")]
        Spotify[("🎵 Spotify API<br/>Music Data")]
        Gemini[("🤖 Gemini AI<br/>Recommendations")]
        YouTube[("📺 YouTube<br/>Karaoke Audio")]
    end

    Client -- "REST API (Axios)" --> Routes
    Realtime -- "WebSocket" --> SocketServer
    Routes --> Auth
    Routes --> Controllers
    Controllers --> Services
    Auth --> Sessions
    Services --> Cache
    Services --> Mongo
    Services --> Cloud
    Services -- "Movie metadata" --> TMDB
    Services -- "Music data" --> Spotify
    Services -- "AI inference" --> Gemini
    Services -- "Audio/Video" --> YouTube

    classDef client fill:#00F0FF,stroke:#0099AA,stroke-width:2px,color:#000
    classDef server fill:#FFB300,stroke:#AA7700,stroke-width:2px,color:#000
    classDef data fill:#a78bfa,stroke:#5b3fa0,stroke-width:2px,color:#fff
    classDef external fill:#FF0055,stroke:#AA0033,stroke-width:2px,color:#fff

    class UI,Context,Realtime client
    class Routes,Auth,Controllers,Services,Cache,SocketServer server
    class Mongo,Sessions,Cloud data
    class TMDB,Spotify,Gemini,YouTube external
```

---

## 🗃️ Data Model

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'primaryColor': '#00F0FF',
  'primaryTextColor': '#000',
  'primaryBorderColor': '#0099AA',
  'secondaryColor': '#FFB300',
  'tertiaryColor': '#a78bfa',
  'lineColor': '#00F0FF',
  'fontFamily': 'monospace'
}}}%%
erDiagram
    USER ||--o{ REVIEW : writes
    USER ||--o{ COMMENT : posts
    USER ||--|| USERPREFERENCE : has
    USER ||--o{ WATCHLIST : manages
    USER ||--o{ USERFAVORITE : curates
    USER ||--o{ CREATORPOST : publishes
    USER ||--o{ FOLLOW : "follows/followed_by"
    USER ||--o| SPOTIFYCONNECTION : links
    USER ||--o{ KARAOKERECORDING : records
    REVIEW ||--o{ COMMENT : receives
    REVIEW }o--|| REVIEWCONTENT : rates
    CREATORPOST ||--o{ POSTANALYTIC : tracks

    USER {
        string username
        string email
        string displayName
        string googleId
        string passwordHash
        string avatar
        date createdAt
    }
    REVIEW {
        ObjectId userId FK
        string mediaId
        int rating
        string text
        date createdAt
    }
    COMMENT {
        ObjectId reviewId FK
        ObjectId userId FK
        ObjectId parentId FK
        string text
        date createdAt
    }
    WATCHLIST {
        ObjectId userId FK
        string mediaId
        string mediaType
        string status
        date addedAt
    }
    USERPREFERENCE {
        ObjectId userId FK
        array genres
        array interests
        boolean onboardingCompleted
    }
    USERFAVORITE {
        ObjectId userId FK
        string mediaId
        string mediaType
        string title
        string posterUrl
    }
    CREATORPOST {
        ObjectId authorId FK
        string title
        string content
        string mediaType
        array images
        int likes
        date createdAt
    }
    FOLLOW {
        ObjectId followerId FK
        ObjectId followingId FK
        date createdAt
    }
    SPOTIFYCONNECTION {
        ObjectId userId FK
        string accessToken
        string refreshToken
        boolean connected
    }
    KARAOKERECORDING {
        ObjectId userId FK
        string songTitle
        string audioUrl
        date createdAt
    }
    REVIEWCONTENT {
        string mediaId
        float averageRating
        int reviewCount
    }
    POSTANALYTIC {
        ObjectId postId FK
        int views
        int likes
        int comments
    }
```

---

## 🤖 AI Chatbot Pipeline

How a natural-language question becomes a personalized recommendation:

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'actorBkg': '#0a0a0f',
  'actorBorder': '#00F0FF',
  'actorTextColor': '#ffffff',
  'signalColor': '#00F0FF',
  'signalTextColor': '#ffffff',
  'noteBkgColor': '#FFB300',
  'noteTextColor': '#000000',
  'noteBorderColor': '#AA7700'
}}}%%
sequenceDiagram
    participant U as 👤 User
    participant FE as 💬 Chatbot UI
    participant R as 🛣️ chat.route
    participant C as 🎮 chat.controller
    participant I as 🧠 intent.service
    participant P as 📝 prompt.service
    participant G as ✨ Gemini AI
    participant T as 🎬 tmdb.service

    U->>FE: "What should I watch if I liked Interstellar?"
    FE->>R: POST /api/chat
    R->>C: handle(message, sessionId)
    C->>I: classifyIntent(message)
    I-->>C: { intent: "recommendation", context: "sci-fi" }
    C->>P: buildPrompt(intent, history, library)
    P->>G: generateContent(prompt)
    G-->>P: AI-generated titles + reasoning
    C->>T: fetchMetadata(titles[])
    T-->>C: posters, ratings, genres, overviews
    C-->>FE: { reply, cards: [...enrichedResults] }
    FE-->>U: 🎬 Interactive movie cards + explanation
```

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

| Technology | Purpose |
|:---:|:---|
| ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) | UI framework with hooks & context |
| ![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white) | Lightning-fast dev server & bundler |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Utility-first styling with glassmorphism design |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-EF008F?style=flat-square&logo=framer&logoColor=white) | Fluid animations & page transitions |
| ![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=flat-square&logo=reactrouter&logoColor=white) | Client-side routing |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO_Client-010101?style=flat-square&logo=socketdotio&logoColor=white) | Real-time watch party communication |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) | API communication layer |
| ![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) | Creator analytics charts |

### Backend

| Technology | Purpose |
|:---:|:---|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | JavaScript runtime |
| ![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white) | REST API framework |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) | NoSQL database |
| ![Mongoose](https://img.shields.io/badge/Mongoose_9-880000?style=flat-square&logo=mongoose&logoColor=white) | ODM with schema validation |
| ![Passport](https://img.shields.io/badge/Passport.js-34E27A?style=flat-square&logo=passport&logoColor=white) | Google OAuth + Local authentication |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO_Server-010101?style=flat-square&logo=socketdotio&logoColor=white) | Real-time bidirectional events |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white) | Image & audio cloud storage |
| ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white) | Runtime input validation |

### External APIs & AI

| Service | Purpose |
|:---:|:---|
| ![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=flat-square&logo=themoviedatabase&logoColor=white) | Movie & TV metadata, posters, trending |
| ![Spotify](https://img.shields.io/badge/Spotify-1DB954?style=flat-square&logo=spotify&logoColor=white) | Music data, user listening history, mood analysis |
| ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75F7?style=flat-square&logo=googlegemini&logoColor=white) | AI-powered chatbot & recommendations |
| ![Google](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat-square&logo=google&logoColor=white) | Secure third-party authentication |

</div>

---

## 📊 Codebase Overview

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'pie1': '#00F0FF', 'pie2': '#8E75F7', 'pie3': '#FFB300', 'pie4': '#FF0055', 'pie5': '#1DB954', 'pie6': '#61DAFB', 'pie7': '#47A248'}}}%%
pie title Codebase Composition
    "Frontend Pages" : 15
    "Frontend Components" : 20
    "Backend Routes" : 18
    "Backend Services" : 15
    "Database Models" : 12
    "UI Components" : 8
    "Config & Utils" : 5
```

<div align="center">

| Metric | Count |
|:---|:---:|
| 📄 Frontend Pages | **15** |
| 🧩 React Components | **28+** |
| 🛣️ API Route Files | **18** |
| ⚙️ Service Files | **15** |
| 🗄️ Database Models | **12** |
| 🌐 External API Integrations | **4** |
| 🔌 WebSocket Events | **Real-time** |

</div>

---

## 📁 Project Structure

```
WatchVerse/
│
├── 🖥️ Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedOrb.jsx            # AI chatbot pulsing orb animation
│   │   │   ├── MediaAssistantChatbot.jsx  # Full AI chatbot interface (1690 lines!)
│   │   │   ├── MediaCard.jsx              # Movie/TV content card
│   │   │   ├── MusicMediaCard.jsx         # Music-specific content card
│   │   │   ├── Navbar.jsx                 # Global navigation with mobile responsive
│   │   │   ├── PrismoLogo.jsx             # Animated brand logo
│   │   │   ├── ReviewComments.jsx         # Threaded review & comment system
│   │   │   ├── SpotifyRecommendations.jsx # Spotify-powered recommendation rows
│   │   │   ├── SplashScreen.jsx           # Cinematic loading screen
│   │   │   ├── StarRating.jsx             # Interactive star rating component
│   │   │   ├── SwipeCard.jsx              # Tinder-style swipe card
│   │   │   ├── SwipeStack.jsx             # Swipe discovery stack manager
│   │   │   ├── profile/                   # Profile sub-components
│   │   │   ├── studio/                    # Creator studio sub-components
│   │   │   ├── ui/                        # Shared UI (ErrorBoundary, Skeleton, etc.)
│   │   │   └── watchparty/                # Watch party components + Sonner toasts
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx                   # Dynamic homepage with 10+ content rows
│   │   │   ├── Browser.jsx                # Advanced search & filter page
│   │   │   ├── Detail.jsx                 # Movie/TV detail with reviews
│   │   │   ├── Login.jsx                  # Auth page with Google OAuth
│   │   │   ├── Register.jsx               # Registration with validation
│   │   │   ├── onBoarding.jsx             # Genre & interest picker
│   │   │   ├── Profile.jsx                # User profile with stats
│   │   │   ├── Watchlist.jsx              # Personal watchlist manager
│   │   │   ├── WatchParty.jsx             # Watch party lobby
│   │   │   ├── WatchRoom.jsx              # Synchronized video room
│   │   │   ├── Karaoke.jsx                # Full karaoke studio
│   │   │   ├── CreatorStudio.jsx          # Content creation editor
│   │   │   ├── CreatorFeed.jsx            # Creator post feed
│   │   │   ├── WatchCreatorPost.jsx       # Individual post viewer
│   │   │   └── ConnectSpotify.jsx         # Spotify OAuth flow
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # Global auth state management
│   │   ├── lib/
│   │   │   └── api.js                     # Axios instance with interceptors
│   │   ├── App.jsx                        # Root app with routing
│   │   └── index.css                      # Global styles + Tailwind
│   │
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── ⚙️ Backend/
│   ├── Models/
│   │   ├── User.js                        # User schema (Google + local auth)
│   │   ├── Review.js                      # Movie/TV reviews
│   │   ├── Comment.js                     # Threaded comments on reviews
│   │   ├── WatchList.js                   # Watchlist entries
│   │   ├── UserPreference.js              # Onboarding preferences
│   │   ├── UserFavorite.js                # Curated favorites
│   │   ├── CreatorPost.js                 # Creator content posts
│   │   ├── Follow.js                      # Social follow graph
│   │   ├── PostAnalytic.js                # Creator analytics
│   │   ├── SpotifyConnection.js           # Spotify OAuth tokens
│   │   ├── KaraokeRecording.js            # Saved karaoke recordings
│   │   └── reviewContent.js               # Aggregated review stats
│   │
│   ├── controllers/
│   │   └── chat.controller.js             # AI chatbot orchestration
│   │
│   ├── routes/
│   │   ├── auth.route.js                  # Google OAuth + local auth
│   │   ├── home.route.js                  # Homepage data aggregation
│   │   ├── movieContent.route.js          # Movie/TV detail endpoints
│   │   ├── reviews.route.js               # CRUD reviews
│   │   ├── comments.route.js              # CRUD comments + threads
│   │   ├── watchlist.route.js             # Watchlist management
│   │   ├── watchparty.route.js            # Watch party CRUD + Socket.IO
│   │   ├── chat.route.js                  # AI chatbot endpoint
│   │   ├── creator.route.js               # Creator post CRUD
│   │   ├── follow.route.js                # Follow/unfollow system
│   │   ├── favorites.route.js             # User favorites management
│   │   ├── karaoke.route.js               # Karaoke songs + recordings
│   │   ├── profile.route.js               # Profile data aggregation
│   │   ├── profile.activity.route.js      # Activity feed
│   │   ├── onboarding.route.js            # Onboarding flow
│   │   ├── spotify.personalization.route.js # Spotify mood-based recs
│   │   ├── spotify.profile.route.js       # Spotify profile data
│   │   └── index.js                       # Route registry
│   │
│   ├── services/
│   │   ├── tmdb.service.js                # TMDB API wrapper (24KB!)
│   │   ├── spotify.service.js             # Spotify API integration
│   │   ├── spotifyPersonalization.service.js # Mood analysis engine
│   │   ├── spotify.profile.service.js     # Spotify profile data
│   │   ├── gemini.service.js              # Google Gemini AI wrapper
│   │   ├── intent.service.js              # NLP intent classifier
│   │   ├── prompt.service.js              # Dynamic prompt builder
│   │   ├── mediaClassifier.service.js     # Media type classifier
│   │   ├── home.service.js                # Homepage data orchestrator
│   │   ├── lyrics.service.js              # Lyrics fetching + sync (21KB!)
│   │   ├── creator.service.js             # Creator post service
│   │   ├── profile.service.js             # Profile aggregation
│   │   ├── movieContent.service.js        # Movie detail service
│   │   ├── statistics.service.js          # User stats calculator
│   │   └── activity.js                    # Activity tracking
│   │
│   ├── config/                            # Passport & DB configuration
│   ├── lib/                               # Shared utilities
│   └── server.js                          # Express app + Socket.IO setup
│
└── README.md                              # You are here! 📍
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

| Requirement | Version |
|:---|:---|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | v18+ |
| ![npm](https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white) | v9+ |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) | Atlas or Local |
| ![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white) | Latest |

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/shiva122019/WatchVerse.git
cd WatchVerse

# 2️⃣ Install backend dependencies
cd Backend
npm install

# 3️⃣ Install frontend dependencies
cd ../Frontend
npm install

# 4️⃣ Set up environment variables (see below)
# Create .env files in both Backend/ and Frontend/

# 5️⃣ Start the backend server
cd ../Backend
npm start
# ✅ Server running on http://localhost:3000

# 6️⃣ Start the frontend dev server
cd ../Frontend
npm run dev
# ✅ App running on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
# Database
MONGODB_URI=mongodb+srv://your-connection-string

# Session
SESSION_SECRET=your-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# TMDB
TMDB_API_KEY=your-tmdb-api-key

# Spotify
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🔌 API Endpoints

<details>
<summary><b>🔐 Authentication</b> — <code>/api/auth</code></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/google` | Initiate Google OAuth flow |
| `GET` | `/google/callback` | Google OAuth callback |
| `POST` | `/register` | Register with email/password |
| `POST` | `/login` | Login with credentials |
| `GET` | `/me` | Get current user session |
| `POST` | `/logout` | Destroy session |

</details>

<details>
<summary><b>🏠 Homepage</b> — <code>/api/home</code></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/` | Aggregated homepage data |
| `GET` | `/section` | Paginated section data |

</details>

<details>
<summary><b>🔍 Browse & Content</b> — <code>/api/content</code></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/search` | Search movies, TV, music |
| `GET` | `/:type/:id` | Get content detail |
| `GET` | `/:type/:id/credits` | Get cast & crew |

</details>

<details>
<summary><b>⭐ Reviews & Comments</b></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/api/reviews` | Create review |
| `GET` | `/api/reviews/:mediaId` | Get reviews for content |
| `POST` | `/api/comments` | Add comment to review |
| `GET` | `/api/comments/:reviewId` | Get comment thread |

</details>

<details>
<summary><b>📋 Watchlist</b> — <code>/api/watchlist</code></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/` | Add to watchlist |
| `GET` | `/` | Get user's watchlist |
| `PATCH` | `/:id` | Update status |
| `DELETE` | `/:id` | Remove from watchlist |

</details>

<details>
<summary><b>🎉 Watch Party</b> — <code>/api/watchparty</code></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/` | Create watch party room |
| `GET` | `/:roomId` | Get room details |
| `WS` | `connection` | Socket.IO real-time sync |

</details>

<details>
<summary><b>🤖 AI Chat</b> — <code>/api/chat</code></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/` | Send message to AI assistant |

</details>

<details>
<summary><b>🎤 Karaoke</b> — <code>/api/karaoke</code></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/songs` | Browse available songs |
| `GET` | `/songs/:id/lyrics` | Get synced lyrics |
| `POST` | `/recordings` | Save a recording |
| `GET` | `/recordings` | Community recordings |

</details>

<details>
<summary><b>📝 Creator</b> — <code>/api/creator</code></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/posts` | Create a post |
| `GET` | `/feed` | Get creator feed |
| `GET` | `/posts/:id` | Get single post |
| `POST` | `/posts/:id/like` | Like a post |

</details>

<details>
<summary><b>🎵 Spotify</b></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/spotify/personalized` | Mood-based movie recs |
| `GET` | `/api/spotify/profile` | Spotify profile data |

</details>

---

## 👥 Team

<div align="center">

Made with ❤️ and lots of ☕ by the **WatchVerse Team**

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-shiva122019-181717?style=for-the-badge&logo=github)](https://github.com/shiva122019)

</div>

---

<div align="center">

<!-- Footer wave -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF0055,50:8E75F7,100:00F0FF&height=120&section=footer" width="100%"/>

<br/>

**⭐ Star this repo if you found it interesting!**

<br/>

*Built with the MERN Stack · Powered by AI · Designed for the Community*

</div>
