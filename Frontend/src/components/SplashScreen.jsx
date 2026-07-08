import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrismoLogoMark } from "@/components/PrismoLogo";

export default function SplashScreen({ onFinish }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2600);
    const t2 = setTimeout(() => onFinish && onFinish(), 3300);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="splash-screen"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden"
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* radial glow */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(0,240,255,0.18) 0%, transparent 55%)",
            }}
          />

          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <PrismoLogoMark size={120} animate />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="font-display text-5xl md:text-6xl tracking-tight text-white">
                Prismo
              </span>
              <span
                className="label-caps text-cyan"
                style={{ letterSpacing: "0.5em" }}
              >
                Movies · Series · Music
              </span>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2, duration: 0.6 }}
              className="h-[2px] w-40 origin-left bg-gradient-to-r from-[#00F0FF] to-[#FFB300]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
