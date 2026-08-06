<div align="center">

![WatchVerse](./banner.svg)

**A premium, next-generation full-stack MERN media discovery and social interaction platform.**

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](#)
[![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](#)
[![Spotify](https://img.shields.io/badge/Spotify-1DB954?style=for-the-badge&logo=spotify&logoColor=white)](#)
[![Gemini](https://img.shields.io/badge/Gemini-8E75F7?style=for-the-badge&logo=googlegemini&logoColor=white)](#)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Data Model](#-data-model)
- [AI Chatbot Flow](#-ai-chatbot-flow)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)

---

## 📌 About

**WatchVerse** is a modern entertainment hub enabling users to seamlessly discover movies and TV series, explore rich metadata, write interactive reviews, swipe through content recommendations, discuss in real-time chat rooms, and sing in a fully integrated Karaoke Studio. 

Powered by [The Movie Database (TMDB)](https://www.themoviedb.org/) and [Spotify Web API](https://developer.spotify.com/), WatchVerse blends high-fidelity media metadata with community-focused features and advanced Gemini AI assistants.

---

## ✨ Key Features

### 🎤 Karaoke Studio & Voice Recorder (NEW!)
Sing along to your favorite tracks directly inside the app:
- **Synced Lyrics Player**: Real-time scrolling and highlighting of transliterated (Romanized) lyrics for regional and Hindi tracks, making them accessible to read.
- **Auto-Play Backing Music**: Interactive HTML5 audio player and YouTube video integrations that trigger automatically when you start recording.
- **Web Audio API voice visualizer**: Smooth canvas visualizer showing real-time frequency waves of your voice.
- **Vocal Cover Mixer**: Automatically mixes your recorded microphone audio with the backing instrumental track, letting you preview your vocal cover inside the studio.
- **Community Submissions**: Save your covers directly to Cloudinary and share them in the Community Recordings catalog!

### 🤖 AI Entertainment Chatbot
Conversational media recommendations powered by the Gemini API:
- Ask natural-language questions like *"Recommend some thriller movies"* or *"Suggest good Hindi songs for karaoke"*.
- Understands search context and returns interactive movie/TV title cards.

### 🏠 Home Page
Browse curated, horizontally scrollable collections inspired by modern streaming platforms:
- Featured hero movie banner.
- Trending, popular & top-rated movies.
- Popular & top-rated TV series.
- Custom recommended feed.

### 🃏 Swipe-Based Discovery
A Tinder-style content discovery experience:
- Interactive swipe cards with fluid Framer Motion animations.
- Quick like/skip decisions to build recommendation algorithms.

### 🔐 User Authentication
- Secure registration and login with Passport.js.
- Secure password hashing using `bcrypt`.
- Persistent session storage in MongoDB using `connect-mongo`.

### 🔎 Browse & Search
- Smart lookup by title, actor, or creator.
- Filter by genre and media type.
- Duplicate result removal, sorted by rating, with smooth infinite scrolling.

### 🎞️ Content Detail Page
- Dedicated high-resolution posters & backdrops.
- Interactive cast list, creator metadata, and average community ratings.
- Watchlist management and user review statistics.

### ⭐ Reviews & Ratings
- 1–5 star ratings with written reviews (one review per user per title).
- Cached community average rating and comments thread on user reviews.

### 📝 Personal Watchlist
Track content across custom states:
- **Want to Watch** · **Watching** · **Watched**

### 💬 Chat Rooms
- Join real-time entertainment rooms to discuss suggestions with other users.

---

## 🏗️ Architecture

High-level view of how the frontend, backend, and external services fit together — colored by layer.

```mermaid
flowchart TD
    subgraph Client["🖥️ Frontend — React + Vite"]
        UI["Pages & Components<br/>Home · Browser · Detail · SwipeStack · Chatbot"]
    end

    subgraph Server["⚙️ Backend — Node.js + Express"]
        Routes["Routes<br/>auth · home · watchlist · comments · chat · onboarding"]
        Auth["Passport.js<br/>Session Auth"]
        Ctrl["Controllers<br/>chat.controller.js"]
        Services["Services Layer<br/>tmdb · spotify · gemini · intent · prompt · mediaClassifier"]
        Cache[("NodeCache")]
    end

    subgraph Data["🗄️ Data Layer"]
        Mongo[("MongoDB<br/>Users · Reviews · Comments · Preferences")]
        SessionStore[("connect-mongo<br/>Session Store")]
    end

    subgraph External["🌐 External APIs"]
        TMDB[("TMDB API")]
        Spotify[("Spotify API")]
        Gemini[("Gemini API")]
    end

    UI -- "Axios / REST" --> Routes
    Routes --> Auth
    Routes --> Ctrl
    Ctrl --> Services
    Auth --> SessionStore
    Services --> Cache
    Services --> Mongo
    Services -- "movie & TV metadata" --> TMDB
    Services -- "music data" --> Spotify
    Services -- "AI responses" --> Gemini
    Routes --> Mongo

    classDef client fill:#60a5fa,stroke:#1d4ed8,stroke-width:2px,color:#0b0e14
    classDef server fill:#e8b84b,stroke:#8a6f2e,stroke-width:2px,color:#0b0e14
    classDef data fill:#a78bfa,stroke:#5b3fa0,stroke-width:2px,color:#0b0e14
    classDef tmdb fill:#01b4e4,stroke:#016a86,stroke-width:2px,color:#ffffff
    classDef spotify fill:#1db954,stroke:#0f7a34,stroke-width:2px,color:#ffffff
    classDef gemini fill:#8e75f7,stroke:#4c2fb0,stroke-width:2px,color:#ffffff

    class UI client
    class Routes,Auth,Ctrl,Services,Cache server
    class Mongo,SessionStore data
    class TMDB tmdb
    class Spotify spotify
    class Gemini gemini
```

---

## 🗃️ Data Model

Core entities and how they relate, based on the Mongoose models in `Backend/Models/`.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'primaryColor': '#e8b84b',
  'primaryTextColor': '#0b0e14',
  'primaryBorderColor': '#8a6f2e',
  'secondaryColor': '#3ec6b6',
  'tertiaryColor': '#a78bfa',
  'lineColor': '#3ec6b6',
  'fontFamily': 'Arial'
}}}%%
erDiagram
    USER ||--o{ REVIEW : writes
    USER ||--o{ COMMENT : posts
    USER ||--|| USERPREFERENCE : has
    REVIEW ||--o{ COMMENT : "receives"
    REVIEW }o--|| REVIEWCONTENT : "rates"

    USER {
        string username
        string passwordHash
        date createdAt
    }
    REVIEW {
        string userId
        string mediaId
        int rating
        string text
    }
    COMMENT {
        string reviewId
        string userId
        string text
    }
    USERPREFERENCE {
        string userId
        array genres
        array interests
    }
    REVIEWCONTENT {
        string mediaId
        float averageRating
        int reviewCount
    }
```

---

## 🤖 AI Chatbot Flow

How a natural-language question turns into a recommendation.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'actorBkg': '#191f2c',
  'actorBorder': '#e8b84b',
  'actorTextColor': '#edeae0',
  'actorLineColor': '#3ec6b6',
  'signalColor': '#3ec6b6',
  'signalTextColor': '#edeae0',
  'labelBoxBkgColor': '#a78bfa',
  'labelBoxBorderColor': '#5b3fa0',
  'labelTextColor': '#0b0e14',
  'noteBkgColor': '#e8b84b',
  'noteTextColor': '#0b0e14',
  'noteBorderColor': '#8a6f2e',
  'sequenceNumberColor': '#0b0e14'
}}}%%
sequenceDiagram
    participant U as 👤 User
    participant FE as 💬 Chatbot UI
    participant R as chat.route.js
    participant C as chat.controller.js
    participant I as intent.service.js
    participant P as prompt.service.js
    participant G as ✨ Gemini API
    participant T as tmdb.service.js

    U->>FE: "What should I watch if I liked Interstellar?"
    FE->>R: POST /chat
    R->>C: handle message
    C->>I: classify intent
    I-->>C: recommendation intent
    C->>P: build contextual prompt
    P->>G: generate suggestions
    G-->>P: AI-generated titles & reasoning
    C->>T: fetch matching metadata
    T-->>C: posters, ratings, genres
    C-->>FE: reply + enriched title cards
    FE-->>U: conversational response
```

---

## 📸 Screenshots

<div align="center">

| Home | Content Detail | Swipe Discovery |
|:---:|:---:|:---:|
| ![Home screenshot](./screenshots/home.png) | ![Detail screenshot](./screenshots/detail.png) | ![Swipe screenshot](./screenshots/swipe.png) |

| AI Chatbot | Watchlist | Chat Rooms |
|:---:|:---:|:---:|
| ![Chatbot screenshot](./screenshots/chatbot.png) | ![Watchlist screenshot](./screenshots/watchlist.png) | ![Chat rooms screenshot](./screenshots/chatrooms.png) |

</div>

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

**🖥️ Frontend**

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-EF008F?style=flat-square&logo=framer&logoColor=white)

</td>
<td valign="top" width="33%">

**⚙️ Backend**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white)
![Passport](https://img.shields.io/badge/Passport.js-34E27A?style=flat-square&logo=passport&logoColor=white)

`Express Session` · `connect-mongo` · `bcrypt` · `NodeCache` · `retry-axios`

</td>
<td valign="top" width="33%">

**🌐 External APIs**

![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=flat-square&logo=themoviedatabase&logoColor=white)
![Spotify](https://img.shields.io/badge/Spotify-1DB954?style=flat-square&logo=spotify&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75F7?style=flat-square&logo=googlegemini&logoColor=white)

</td>
</tr>
</table>

---

## 📁 Project Structure

```
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
│   │   │   ├── onBoarding.jsx
│   │   │   └── Karaoke.jsx (New!)
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
│   │   ├── reviewContent.js
│   │   └── KaraokeRecording.js (New!)
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
│   │   ├── karaoke.route.js (New!)
│   │   └── index.js
│   │
│   ├── services/
│   │   ├── gemini.service.js
│   │   ├── home.service.js
│   │   ├── intent.service.js
│   │   ├── mediaClassifier.service.js
│   │   ├── prompt.service.js
│   │   ├── spotify.service.js
│   │   ├── tmdb.service.js
│   │   └── lyrics.service.js (New!)
│   │
│   ├── config/
│   ├── lib/
│   └── server.js
│
├── package.json
├── package-lock.json
└── README.md
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/shiva122019/WatchVerse.git
cd WatchVerse

# Install dependencies
cd Frontend && npm install
cd ../Backend && npm install

# Set up environment variables
# Add your TMDB, Spotify, Gemini, and MongoDB credentials to .env files

# Run the backend
cd Backend && npm start

# Run the frontend
cd Frontend && npm run dev
```

---

<div align="center">

Built with ❤️ using the **MERN** stack

</div>
