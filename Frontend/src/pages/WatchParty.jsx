// // import { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { motion } from "framer-motion";
// // import { Clapperboard } from "lucide-react";

// // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// // export default function WatchParty() {
// //   const [creating, setCreating] = useState(false);
// //   const [error, setError] = useState("");
// //   const navigate = useNavigate();

// //   const hostParty = async () => {
// //     setCreating(true);
// //     setError("");
// //     try {
// //       const res = await fetch(`${API_BASE}/watchparty/rooms`, { method: "POST" });
// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.error || "Couldn't create a room");

// //       sessionStorage.setItem(`wp_host_${data.roomCode}`, data.hostToken);
// //       navigate(`/watch-room/${data.roomCode}`);
// //     } catch (err) {
// //       setError(err.message || "Something went wrong. Try again.");
// //       setCreating(false);
// //     }
// //   };

// //   return (
// //     <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6">
// //       {/* signature element: a soft projector-cone glow, the one bold gesture on an otherwise quiet page */}
// //       <div
// //         className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 opacity-30 blur-3xl"
// //         style={{
// //           background:
// //             "radial-gradient(ellipse at top, #5CF2E3 0%, transparent 65%)",
// //         }}
// //       />
// //       <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_85%)]" />

// //       <motion.div
// //         initial={{ opacity: 0, y: 16 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.6, ease: "easeOut" }}
// //         className="relative z-10 flex max-w-xl flex-col items-center text-center"
// //       >
// //         <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#5CF2E3]/30 bg-[#5CF2E3]/10">
// //           <Clapperboard className="h-6 w-6" style={{ color: "#5CF2E3" }} />
// //         </span>

// //         <span className="label-caps mb-3 text-xs tracking-[0.3em]" style={{ color: "#5CF2E3" }}>
// //           Prismo · Watch Party
// //         </span>

// //         <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
// //           Welcome to your virtual movie theatre
// //         </h1>

// //         <p className="mt-5 max-w-md text-neutral-400">
// //           Open a room, share one link, and watch together — synced play,
// //           pause, chat, and reactions, no matter where everyone's sitting.
// //         </p>

// //         <button
// //           onClick={hostParty}
// //           disabled={creating}
// //           className="mt-10 rounded-full px-8 py-4 text-base font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
// //           style={{ backgroundColor: "#5CF2E3" }}
// //         >
// //           {creating ? "Setting up your room…" : "Host a Watch Party"}
// //         </button>

// //         {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
// //       </motion.div>
// //     </div>
// //   );
// // }


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Clapperboard } from "lucide-react";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// export default function WatchParty() {
//   const [creating, setCreating] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const hostParty = async () => {
//     setCreating(true);
//     setError("");
//     try {
//       const res = await fetch(`${API_BASE}/watchparty/rooms`, { method: "POST" });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Couldn't create a room");

//       sessionStorage.setItem(`wp_host_${data.roomCode}`, data.hostToken);
//       navigate(`/watch-room/${data.roomCode}`);
//     } catch (err) {
//       setError(err.message || "Something went wrong. Try again.");
//       setCreating(false);
//     }
//   };

//   return (
//     <div className="relative flex min-h-screen items-center justify-end overflow-hidden bg-[#050505] pl-6 pr-4 sm:pl-12 sm:pr-8 lg:pl-24 lg:pr-12">
//   <video
//     className="pointer-events-none absolute inset-0 h-full w-full object-cover"
//     src="/watch-party-bg.mp4"
//     autoPlay
//     muted
//     loop
//     playsInline
//   />

//   {/* dark-to-light gradient: solid behind the text on the right, fading out toward the left */}
//   <div
//     className="pointer-events-none absolute inset-0"
//     style={{
//       background:
//         "linear-gradient(to left, rgba(5,5,5,0.98) 0%, rgba(5,5,5,0.92) 30%, rgba(5,5,5,0.65) 60%, rgba(5,5,5,0.35) 100%)",
//     }}
//   />

//   <div className="pointer-events-none absolute inset-0 bg-black/35" />

//   {/* subtle projector-cone glow, kept behind the text */}
//   <div
//     className="pointer-events-none absolute right-0 top-0 h-[520px] w-[900px] opacity-20 blur-3xl"
//     style={{
//       background:
//         "radial-gradient(ellipse at top right, #5CF2E3 0%, transparent 65%)",
//     }}
//   />

//   <motion.div
//     initial={{ opacity: 0, y: 16 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.6, ease: "easeOut" }}
//     className="relative z-10 -mt-12 flex max-w-xl flex-col items-center text-center py-24"
//   >
//         <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#5CF2E3]/30 bg-[#5CF2E3]/10">
//           <Clapperboard className="h-6 w-6" style={{ color: "#5CF2E3" }} />
//         </span>

//         <span className="label-caps mb-3 text-xs tracking-[0.3em]" style={{ color: "#5CF2E3" }}>
//           Prismo · Watch Party
//         </span>

//         <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
//           Welcome to your virtual movie theatre
//         </h1>

//         <p className="mt-5 max-w-md text-neutral-300">
//           Open a room, share one link, and watch together — synced play,
//           pause, chat, and reactions, no matter where everyone's sitting.
//         </p>

//         <button
//           onClick={hostParty}
//           disabled={creating}
//           className="mt-10 rounded-full px-8 py-4 text-base font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
//           style={{ backgroundColor: "#5CF2E3" }}
//         >
//           {creating ? "Setting up your room…" : "Host a Watch Party"}
//         </button>

//         {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
//       </motion.div>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clapperboard, Play } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function WatchParty() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const hostParty = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/watchparty/rooms`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't create a room");

      sessionStorage.setItem(`wp_host_${data.roomCode}`, data.hostToken);
      navigate(`/watch-room/${data.roomCode}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setCreating(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-end overflow-hidden bg-[#050505] pl-6 pr-4 sm:pl-12 sm:pr-8 lg:pl-24 lg:pr-12">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src="/watch-party-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* dark-to-light gradient: solid behind the text on the right, fading out toward the left */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, rgba(5,5,5,0.98) 0%, rgba(5,5,5,0.92) 30%, rgba(5,5,5,0.65) 60%, rgba(5,5,5,0.35) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-black/35" />

      {/* subtle projector-cone glow, kept behind the text */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[520px] w-[900px] opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(ellipse at top right, #5CF2E3 0%, transparent 65%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 -mt-12 flex max-w-xl flex-col items-center py-24 text-center"
      >
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#5CF2E3]/30 bg-[#5CF2E3]/10">
          <Clapperboard className="h-6 w-6" style={{ color: "#5CF2E3" }} />
        </span>

        <span className="label-caps mb-3 text-xs tracking-[0.3em]" style={{ color: "#5CF2E3" }}>
          Prismo · Watch Party
        </span>

        <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Welcome to your virtual{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #5CF2E3 0%, #8B5CF6 100%)" }}
          >
            movie theatre
          </span>
        </h1>

        <p className="mt-5 max-w-md text-neutral-300">
          Open a room, share one link, and watch together — synced play,
          pause, chat, and reactions, no matter where everyone's sitting.
        </p>

        <button
          onClick={hostParty}
          disabled={creating}
          className="mt-10 rounded-full px-8 py-4 text-base font-semibold text-[#04223a] transition hover:brightness-105 disabled:opacity-60"
          style={{ background: "linear-gradient(90deg, #5CF2E3 0%, #8B5CF6 100%)" }}
        >
          {creating ? "Setting up your room…" : "Host a Watch Party"}
        </button>

        <button
          onClick={() => navigate("/watchparty/how-it-works")}
          className="mt-4 flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200"
        >
          How it works
          <Play className="h-3 w-3" />
        </button>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </motion.div>
    </div>
  );
}