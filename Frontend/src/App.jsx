import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "./components/watchparty/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import Browse from "./pages/Browser";
import CreatorStudio from "./pages/CreatorStudio";
import CreatorFeed from "./pages/CreatorFeed";
import WatchCreatorPost from "./pages/WatchCreatorPost";
import Detail from "./pages/Detail";
import CreatorProtectedRoute from "./components/CreatorProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AudioVisualizer from "./components/MediaAssistantChatbot";
import WatchParty from "./pages/WatchParty";
import WatchRoom from "./pages/WatchRoom";
import Karaoke from "./pages/Karaoke";
import "./App.css";
import Onboarding from "./pages/onBoarding";
import ConnectSpotify from "./pages/ConnectSpotify";

function AppShell({ splashDone }) {
  const location = useLocation();
  // The watch room is a full-screen, self-contained experience — no global
  // nav/footer, so it fills the viewport exactly and never needs to scroll.
  const isImmersive = location.pathname.startsWith("/watch-room");

  return (
    <>
      {!isImmersive && <Navbar />}
      <main className={isImmersive ? "" : "relative z-[2]"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/content/:type/:id" element={<Detail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/connect-spotify"
            element={
              <ProtectedRoute>
                <ConnectSpotify />
              </ProtectedRoute>
            }
          />
          <Route path="/onBoarding" element={<Onboarding />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:username" element={<Profile />} />
          <Route
            path="/settings/account"
            element={
              <ProtectedRoute>
                <settings />
              </ProtectedRoute>
            }
          />
          <Route path="/creator-feed" element={<CreatorFeed />} />
          <Route path="/watch-creator/:id" element={<WatchCreatorPost />} />
          <Route
            path="/studio"
            element={
              <CreatorProtectedRoute>
                <CreatorStudio />
              </CreatorProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchparty"
            element={
              <ProtectedRoute>
                <WatchParty />
              </ProtectedRoute>
            }
          />

          <Route
            path="/watch-room/:roomId"
            element={
              <ProtectedRoute>
                <WatchRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/song/:id/karaoke"
            element={
              <ProtectedRoute>
                <Karaoke />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {splashDone && !isImmersive && (
        <AudioVisualizer
          siteName="WatchVerse"
          chatUrl="http://localhost:5001/chat"
        />
      )}

      {!isImmersive && (
        <footer className="border-t border-white/5 py-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-600">
          Prismo · Movies · Series · Music
        </footer>
      )}
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("prismo_splash_done") === "1",
  );

  useEffect(() => {
    if (splashDone) sessionStorage.setItem("prismo_splash_done", "1");
  }, [splashDone]);

  return (
    <div className="grain min-h-screen">
      {!splashDone && (
        <SplashScreen
          onFinish={() => {
            sessionStorage.setItem("prismo_splash_done", "1");
            setSplashDone(true);
          }}
        />
      )}
      <AuthProvider>
        <BrowserRouter>
          <AppShell splashDone={splashDone} />
        </BrowserRouter>
      </AuthProvider>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
