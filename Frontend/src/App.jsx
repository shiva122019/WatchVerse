import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import Browse from "./pages/Browser";
import Detail from "./pages/Detail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Watchlist from "./pages/Watchlist";
import ProtectedRoute from "./components/ProtectedRoute";
import AudioVisualizer from "./components/MediaAssistantChatbot";
import "./App.css";
import Onboarding from "./pages/onBoarding";

function AppShell({ splashDone }) {
  return (
    <>
      <Navbar />
      <main className="relative z-[2]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/content/:type/:id" element={<Detail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onBoarding" element={<Onboarding />} />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {splashDone && (
        <AudioVisualizer
          siteName="WatchVerse"
          chatUrl="http://localhost:5001/chat"
        />
      )}

      <footer className="border-t border-white/5 py-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-600">
        Prismo · Movies · Series · Music
      </footer>
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
