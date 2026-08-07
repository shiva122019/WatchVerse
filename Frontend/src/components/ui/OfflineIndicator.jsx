import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowBackOnline(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      
      // Hide the "Back Online" message after 3 seconds
      setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex justify-center">
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="flex items-center gap-3 rounded-full border border-[#FF0055]/30 bg-[#FF0055]/10 px-5 py-2.5 shadow-[0_0_20px_rgba(255,0,85,0.2)] backdrop-blur-md"
          >
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF0055] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF0055]"></span>
            </div>
            <WifiOff className="h-4 w-4 text-[#FF0055]" />
            <span className="text-sm font-semibold tracking-wide text-[#FF0055]">You are currently offline</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBackOnline && !isOffline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="flex items-center gap-3 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-5 py-2.5 shadow-[0_0_20px_rgba(0,240,255,0.2)] backdrop-blur-md"
          >
            <Wifi className="h-4 w-4 text-[#00F0FF]" />
            <span className="text-sm font-semibold tracking-wide text-[#00F0FF]">Back online</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
