import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  RotateCcw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Check,
  Gauge,
} from "lucide-react";

let ytApiPromise = null;
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
  return ytApiPromise;
}

// How much bigger than the visible frame the player renders.
// Bump this up if slivers of the title bar / logo still peek through.
const ZOOM_PERCENT = 190;

// How far a single tap on the skip buttons moves playback.
const SEEK_SECONDS = 10;

// How long the mouse can sit idle before the control chrome hides itself.
const AUTO_HIDE_MS = 2500;

// How often we poll the live player for the scrub bar (ms).
const TIMELINE_POLL_MS = 250;

// ---------------------------------------------------------------------------
// Playback speed + quality option tables
// ---------------------------------------------------------------------------

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];

// Every quality YouTube's IFrame API can theoretically report, in the order
// we want them displayed. Whatever isn't in the video's own
// getAvailableQualityLevels() list gets rendered disabled rather than
// hidden, so the menu shape is stable across videos.
const QUALITY_ORDER = ["auto", "hd2160", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny"];
const QUALITY_LABELS = {
  auto: "Auto",
  hd2160: "2160p",
  hd1440: "1440p",
  hd1080: "1080p",
  hd720: "720p",
  large: "480p",
  medium: "360p",
  small: "240p",
  tiny: "144p",
};

// Formats seconds as m:ss, growing to h:mm:ss once the video runs past an hour.
function formatTime(totalSeconds) {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const total = Math.floor(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Small reusable pieces used by the new premium control chrome
// ---------------------------------------------------------------------------

// Circular glass button used for the three big center transport controls.
// Handles its own hover/tap scale animation plus a Netflix-style ripple
// that spawns from wherever the pointer landed.
function CenterControlButton({ onClick, children, size = 48, disabled, ariaLabel, className = "" }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rippleSize = Math.max(rect.width, rect.height);
    const id = `${Date.now()}-${Math.random()}`;
    setRipples((r) => [
      ...r,
      { id, x: e.clientX - rect.left - rippleSize / 2, y: e.clientY - rect.top - rippleSize / 2, size: rippleSize },
    ]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
    onClick?.(e);
  };

  // Plain, small, unblurred: white content on a thin translucent-black disc.
  // No backdrop-blur here on purpose — this sits directly over the video.
  // Takes children rather than an icon+sublabel pair — the old version
  // centered an icon AND a "10" label on top of each other in the same
  // spot, which is what produced the doubled/smudged look. Skip buttons
  // now pass icon + number as a small side-by-side row instead.
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center overflow-hidden rounded-full bg-black/35 text-white shadow-md transition-colors hover:bg-black/50 disabled:opacity-40 ${className}`}
    >
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ opacity: 0.4, scale: 0 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      {children}
    </motion.button>
  );
}

// Horizontal draggable scrub bar. Reports live drag position back up via
// onScrub while dragging, and commits the seek via onCommit on release —
// mirrors how the volume slider below works so both feel the same.
function Timeline({ currentTime, duration, onScrub, onCommit, disabled }) {
  const trackRef = useRef(null);
  const [dragTime, setDragTime] = useState(null);
  const draggingRef = useRef(false);

  const ratioFromClientX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const handlePointerDown = (e) => {
    if (disabled || !duration) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const t = ratioFromClientX(e.clientX) * duration;
    setDragTime(t);
    onScrub?.(t);
  };
  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const t = ratioFromClientX(e.clientX) * duration;
    setDragTime(t);
    onScrub?.(t);
  };
  const handlePointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const t = dragTime ?? ratioFromClientX(e.clientX) * duration;
    setDragTime(null);
    onCommit?.(t);
  };

  const shown = dragTime ?? currentTime;
  const pct = duration ? Math.min(100, Math.max(0, (shown / duration) * 100)) : 0;

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`group relative h-4 flex-1 cursor-pointer touch-none ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/25" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#5CF2E3] transition-[width] duration-100"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md transition-transform group-hover:scale-110"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

// Compact horizontal volume slider that sits next to the mute button.
// NOTE: this used to be a motion.div that animated its own width in from 0
// every time it mounted. Because it lives inside the auto-hiding "chrome"
// block (which fully unmounts/remounts on every hide/show cycle), that
// meant the slider replayed its "grow in" animation on every single mouse
// move — which is what made it intermittently look cut off / truncated.
// It doesn't need an entrance animation of its own; the parent chrome
// already fades everything in and out together. Now it's just a plain,
// fixed-width, non-shrinking element.
function VolumeSlider({ volume, onChange }) {
  const trackRef = useRef(null);
  const draggingRef = useRef(false);

  const ratioFromClientX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(Math.round(ratioFromClientX(e.clientX) * 100));
  };
  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    onChange(Math.round(ratioFromClientX(e.clientX) * 100));
  };
  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <div className="w-[84px] shrink-0">
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={(e) => {
          e.preventDefault();
          onChange(volume + (e.deltaY > 0 ? -5 : 5));
        }}
        className="relative h-4 w-full cursor-pointer touch-none"
      >
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/25" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#5CF2E3]"
          style={{ width: `${volume}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md"
          style={{ left: `${volume}%` }}
        />
      </div>
    </div>
  );
}

// Bottom-right settings popover: a root menu that drills into "Playback
// Speed" and "Quality" submenus. Kept as one component with an internal
// view state so the whole thing can animate as a single glass panel.
function SettingsPanel({
  view,
  onViewChange,
  playbackRate,
  onPlaybackRateChange,
  quality,
  onQualityChange,
  availableQualities,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute bottom-12 right-0 w-52 overflow-hidden rounded-2xl border border-white/15 bg-black/70 shadow-2xl backdrop-blur-2xl"
    >
      {view === "menu" && (
        <div className="p-1.5">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">Settings</div>
          <button
            onClick={() => onViewChange("speed")}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/90 transition hover:bg-white/10"
          >
            <span className="flex items-center gap-2">
              <Gauge className="h-4 w-4" /> Playback Speed
            </span>
            <span className="flex items-center gap-1 text-white/40">
              {playbackRate}x <ChevronRight className="h-4 w-4" />
            </span>
          </button>
          <button
            onClick={() => onViewChange("quality")}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/90 transition hover:bg-white/10"
          >
            <span>Quality</span>
            <span className="flex items-center gap-1 text-white/40">
              {QUALITY_LABELS[quality] ?? "Auto"} <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      {view === "speed" && (
        <div className="p-1.5">
          <button
            onClick={() => onViewChange("menu")}
            className="mb-1 flex w-full items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40 transition hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" /> Playback Speed
          </button>
          <div className="max-h-56 overflow-y-auto">
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                onClick={() => onPlaybackRateChange(rate)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white/90 transition hover:bg-white/10"
              >
                <span className={rate === playbackRate ? "text-[#5CF2E3]" : ""}>{rate === 1 ? "Normal" : `${rate}x`}</span>
                {rate === playbackRate && <Check className="h-4 w-4 text-[#5CF2E3]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "quality" && (
        <div className="p-1.5">
          <button
            onClick={() => onViewChange("menu")}
            className="mb-1 flex w-full items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40 transition hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" /> Quality
          </button>
          <div className="max-h-56 overflow-y-auto">
            {QUALITY_ORDER.filter((q) => q === "auto" || availableQualities.includes(q)).map((q) => (
              <button
                key={q}
                onClick={() => onQualityChange(q)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white/90 transition hover:bg-white/10"
              >
                <span className={q === quality ? "text-[#5CF2E3]" : ""}>{QUALITY_LABELS[q]}</span>
                {q === quality && <Check className="h-4 w-4 text-[#5CF2E3]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------

export default function TrailerPlayer({
  trailerKey,
  posterUrl,
  movieTitle,
  onChangeMovie,
  onRequestPlayPause,
  onRequestSeek,
  syncedPlaying,
  syncedTime,
  seekVersion,
  // New: playback-speed sync, following the exact same request/synced
  // pattern as play/pause and seek above. The parent room component needs
  // to wire a "playback-speed" socket event the same way it already wires
  // play/pause and seek, and pass the room's agreed rate back in as
  // syncedPlaybackRate. Both default so this file keeps working even
  // before that wiring exists.
  onRequestPlaybackRate = () => {},
  syncedPlaybackRate = 1,
}) {
  // clipRef: outer viewport, overflow-hidden, NEVER touched by YT API.
  // zoomRef: the div we actually scale up + center. Pure CSS, owned by
  //          React the whole time — YT never sees or touches this one.
  //          Its own children are managed imperatively (see below), NOT
  //          by React, so it must stay empty in JSX.
  const clipRef = useRef(null);
  const zoomRef = useRef(null);
  const playerRef = useRef(null);
  const applyingRemoteRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  // --- New: volume -----------------------------------------------------
  const [volume, setVolumeState] = useState(100);
  const previousVolumeRef = useRef(100);

  // --- New: timeline -----------------------------------------------------
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isScrubbingRef = useRef(false);

  // --- New: settings (speed + quality) -----------------------------------
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState("menu"); // "menu" | "speed" | "quality"
  const [quality, setQuality] = useState("auto");
  const [availableQualities, setAvailableQualities] = useState([]);

  // --- New: auto-hide control chrome --------------------------------------
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef(null);
  const settingsOpenRef = useRef(settingsOpen);
  settingsOpenRef.current = settingsOpen;

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setHasStartedPlaying(false);

    loadYouTubeAPI().then((YT) => {
      if (cancelled || !zoomRef.current) return;

      // IMPORTANT: never reuse a mount node across videos. YT.Player()
      // removes whatever element you give it from the DOM and replaces
      // it with its own iframe. So on the *first* video that node is
      // fine, but by the time you change movies it's already detached —
      // handing it back in gives YT.Player a dead node to swap out,
      // which produces no visible iframe at all (black screen). Instead,
      // wipe zoomRef (which React never touches, so it's always live)
      // and give YT a brand-new node every single time.
      zoomRef.current.innerHTML = "";
      const mountNode = document.createElement("div");
      mountNode.style.width = "100%";
      mountNode.style.height = "100%";
      zoomRef.current.appendChild(mountNode);

      playerRef.current = new YT.Player(mountNode, {
        videoId: trailerKey,
        // Telling YT to fill 100% of its immediate parent (the zoom div)
        // means we never have to fight the iframe's own size afterwards —
        // it just always fills whatever box we give it.
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            setReady(true);

            const iframe = e.target.getIframe();
            iframe.style.pointerEvents = "none";
            iframe.setAttribute("tabindex", "-1");

            if (syncedTime > 0) e.target.seekTo(syncedTime, true);
            if (!syncedPlaying) e.target.pauseVideo();
            // Apply whatever playback rate the room already agreed on.
            e.target.setPlaybackRate?.(syncedPlaybackRate);
            setVolumeState(e.target.getVolume?.() ?? 100);
            // Quality levels are frequently empty until playback actually
            // starts, so we also refresh this in onStateChange below.
            const levels = e.target.getAvailableQualityLevels?.() ?? [];
            setAvailableQualities(levels);
          },
          onStateChange: (e) => {
            if (cancelled) return;

            if (applyingRemoteRef.current) return;

            if (e.data === YT.PlayerState.PLAYING) {
              setHasStartedPlaying(true);

              const levels = e.target.getAvailableQualityLevels?.() ?? [];
              if (levels.length) setAvailableQualities(levels);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailerKey]);

  // React to room state changing (remote play/pause)
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    applyingRemoteRef.current = true;
    if (syncedPlaying) playerRef.current.playVideo();
    else playerRef.current.pauseVideo();
    const t = setTimeout(() => (applyingRemoteRef.current = false), 50);
    return () => clearTimeout(t);
  }, [syncedPlaying, ready]);

  // React to a remote seek. seekVersion is a counter rather than syncedTime
  // itself, so a seek back to the same rounded second still fires — plain
  // value-equality would otherwise swallow it. Skipped on first mount/join
  // since onReady above already handles the initial position.
  useEffect(() => {
    if (!ready || !playerRef.current || seekVersion === 0) return;
    applyingRemoteRef.current = true;
    playerRef.current.seekTo(syncedTime, true);
    const t = setTimeout(() => (applyingRemoteRef.current = false), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekVersion, ready]);

  // New: react to a remote playback-speed change, same shape as the two
  // effects above.
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    playerRef.current.setPlaybackRate?.(syncedPlaybackRate);
  }, [syncedPlaybackRate, ready]);

  // New: poll the live player every 250ms for the scrub bar. Skipped while
  // the user is actively dragging the thumb so their drag isn't fought.
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      if (!playerRef.current || isScrubbingRef.current) return;
      const t = playerRef.current.getCurrentTime?.() ?? 0;
      const d = playerRef.current.getDuration?.() ?? 0;
      setCurrentTime(t);
      if (d) setDuration(d);
    }, TIMELINE_POLL_MS);
    return () => clearInterval(interval);
  }, [ready]);

  // Auto-hide the control chrome after AUTO_HIDE_MS of no pointer activity,
  // regardless of play state — controls are shown on mount so the player
  // isn't blank, then behave purely on pointer activity from then on.
  useEffect(() => {
    hideTimeoutRef.current = setTimeout(() => {
      if (!settingsOpenRef.current) setControlsVisible(false);
    }, AUTO_HIDE_MS);
    return () => clearTimeout(hideTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wakeControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (!settingsOpenRef.current) setControlsVisible(false);
    }, AUTO_HIDE_MS);
  };

  // Hides the chrome the instant the cursor leaves the player — no delay,
  // regardless of whether the video is playing or paused. Settings menu
  // being open is still respected so it doesn't vanish mid-selection.
  const handlePointerLeavePlayer = () => {
    clearTimeout(hideTimeoutRef.current);
    if (!settingsOpen) setControlsVisible(false);
  };

  // New: keyboard shortcuts — Space toggles play, ← / → skip 10s. Ignored
  // while the person is typing somewhere else in the app (e.g. room chat).
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable;
      if (isTyping || !ready) return;

      if (e.code === "Space") {
        e.preventDefault();
        wakeControls();
        togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        wakeControls();
        seekBy(-SEEK_SECONDS);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        wakeControls();
        seekBy(SEEK_SECONDS);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, syncedPlaying]);

  const togglePlay = () => {
    if (!ready) return;
    onRequestPlayPause(!syncedPlaying);
  };

  // Skips playback by `delta` seconds (positive = forward, negative = back),
  // clamped to [0, duration]. Seeks locally right away so the person who
  // tapped sees it instantly, then broadcasts the same target time so
  // everyone else's player lands on it too.
  const seekBy = (delta) => {
    if (!ready || !playerRef.current) return;
    const current = playerRef.current.getCurrentTime();
    const dur = playerRef.current.getDuration() || Infinity;
    const target = Math.min(dur, Math.max(0, current + delta));
    playerRef.current.seekTo(target, true);
    setCurrentTime(target);
    onRequestSeek(target);
  };

  // New: called continuously while the timeline thumb is being dragged.
  const handleTimelineScrub = (t) => {
    isScrubbingRef.current = true;
    setCurrentTime(t);
  };

  // New: called once the timeline thumb (or a click on the track) settles.
  const handleTimelineCommit = (t) => {
    isScrubbingRef.current = false;
    if (!playerRef.current) return;
    playerRef.current.seekTo(t, true);
    setCurrentTime(t);
    onRequestSeek(t);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      const restore = previousVolumeRef.current || 50;
      playerRef.current.unMute();
      playerRef.current.setVolume(restore);
      setVolumeState(restore);
      setMuted(false);
    } else {
      previousVolumeRef.current = volume || previousVolumeRef.current;
      playerRef.current.mute();
      setMuted(true);
    }
  };

  // New: shared handler for both the drag slider and the mouse-wheel nudge.
  const handleVolumeChange = (next) => {
    const clamped = Math.min(100, Math.max(0, Math.round(next)));
    setVolumeState(clamped);
    playerRef.current?.setVolume(clamped);
    if (clamped === 0) {
      playerRef.current?.mute();
      setMuted(true);
    } else {
      playerRef.current?.unMute();
      previousVolumeRef.current = clamped;
      setMuted(false);
    }
  };

  // New: quality only affects the local viewer, so it isn't broadcast —
  // note YouTube's IFrame API treats this as a hint and may still pick its
  // own adaptive quality, but we forward the request either way.
  const changeQuality = (level) => {
    playerRef.current?.setPlaybackQuality(level);
    setQuality(level);
    setSettingsView("menu");
    setSettingsOpen(false);
  };

  // New: playback speed IS synced — matches existing play/pause + seek sync.
  const changePlaybackRate = (rate) => {
    playerRef.current?.setPlaybackRate(rate);
    onRequestPlaybackRate(rate);
    setSettingsView("menu");
    setSettingsOpen(false);
  };

  // No blackout cover on pause — pausing should just freeze on the current
  // frame, not hide the video behind an opaque layer. Controls visibility
  // is driven purely by pointer activity now (see wakeControls /
  // handlePointerLeavePlayer below), not by play state.
  const showChrome = controlsVisible;
  const progressDuration = duration || 0;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl bg-black"
      onPointerMove={wakeControls}
      onPointerEnter={wakeControls}
      onPointerLeave={handlePointerLeavePlayer}
    >
      {/* Clipping viewport — never manipulated by the YT API */}
      <div
        ref={clipRef}
        className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
      >
        {/* Zoom layer — plain CSS, always 145% centered, also never
            touched by the YT API. This is what actually pushes the
            title bar and logo outside the visible edges, permanently. */}
        <div
          ref={zoomRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: `${ZOOM_PERCENT}%`, height: `${ZOOM_PERCENT}%` }}
        />
        {/* zoomRef stays empty in JSX on purpose — its child mount node
            is created and replaced imperatively in the effect above, so
            React must never try to reconcile children here itself. */}
      </div>

      {/* New: premium Netflix-style control chrome (top bar, center
          transport controls, bottom timeline/volume/settings bar). All
          three pieces fade + translate together and auto-hide during
          playback, exactly like the old bottom-only control bar used to,
          just with a lot more in it. */}
      <AnimatePresence>
        {showChrome && (
          <motion.div
            key="chrome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-40"
          >
            {/* Top bar: movie title (left) + search movie (right) */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-start bg-gradient-to-b from-black/70 via-black/20 to-transparent p-4"
            >
              <h3 className="truncate text-sm font-medium text-white/90 sm:text-base">
                {movieTitle}
              </h3>
            </motion.div>

            {/* Center transport controls: skip back / play-pause / skip forward */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto absolute inset-0 flex items-center justify-center gap-10"
            >
              <CenterControlButton
                onClick={() => seekBy(-SEEK_SECONDS)}
                size={40}
                disabled={!ready}
                ariaLabel="Back 10 seconds"
              >
                <span className="flex items-center gap-0.5">
                  <RotateCcw style={{ width: 15, height: 15 }} />
                  <span className="text-[10px] font-bold leading-none">10</span>
                </span>
              </CenterControlButton>

              <CenterControlButton
                onClick={togglePlay}
                size={52}
                disabled={!ready}
                ariaLabel={syncedPlaying ? "Pause" : "Play"}
                className="bg-black/55 hover:bg-black/65"
              >
                {syncedPlaying ? (
                  <Pause style={{ width: 30, height: 30 }} fill="white" />
                ) : (
                  <Play style={{ width: 30, height: 30, marginLeft: 2 }} fill="white" />
                )}
              </CenterControlButton>

              <CenterControlButton
                onClick={() => seekBy(SEEK_SECONDS)}
                size={40}
                disabled={!ready}
                ariaLabel="Forward 10 seconds"
              >
                <span className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold leading-none">10</span>
                  <RotateCw style={{ width: 15, height: 15 }} />
                </span>
              </CenterControlButton>
            </motion.div>

            {/* Bottom bar: volume, timeline, time, settings */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4"
            >
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1.5 shadow-lg backdrop-blur-xl">
                <button
                  onClick={toggleMute}
                  disabled={!ready}
                  className={`rounded-full p-1.5 transition hover:bg-white/15 disabled:opacity-40 ${
                    muted ? "text-white/90" : "text-[#5CF2E3]"
                  }`}
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <VolumeSlider volume={muted ? 0 : volume} onChange={handleVolumeChange} />
              </div>

              <span className="w-12 shrink-0 text-right text-xs tabular-nums text-white/70">
                {formatTime(currentTime)}
              </span>

              <Timeline
                currentTime={currentTime}
                duration={progressDuration}
                disabled={!ready}
                onScrub={handleTimelineScrub}
                onCommit={handleTimelineCommit}
              />

              <span className="w-14 shrink-0 text-xs tabular-nums text-white/70">
                {formatTime(progressDuration)}
              </span>

              <div className="relative">
                <button
                  onClick={() => {
                    setSettingsOpen((o) => !o);
                    setSettingsView("menu");
                  }}
                  className="rounded-full border border-white/15 bg-white/10 p-2.5 text-white/90 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-xl"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {settingsOpen && (
                    <SettingsPanel
                      view={settingsView}
                      onViewChange={setSettingsView}
                      playbackRate={syncedPlaybackRate}
                      onPlaybackRateChange={changePlaybackRate}
                      quality={quality}
                      onQualityChange={changeQuality}
                      availableQualities={availableQualities}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
