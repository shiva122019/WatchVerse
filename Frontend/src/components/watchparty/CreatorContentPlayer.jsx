import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Shuffle,
  Music,
} from "lucide-react";

// How far a single tap on the skip buttons moves playback.
const SEEK_SECONDS = 10;

// How long the pointer can sit idle before the control chrome hides itself.
const AUTO_HIDE_MS = 2500;

function formatTime(totalSeconds) {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const total = Math.floor(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Same draggable-scrub-bar pattern used by TrailerPlayer, kept local here
// so this file has no dependency on the YouTube-specific player.
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

function CircleButton({ onClick, children, size = 48, disabled, ariaLabel, className = "" }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-full bg-black/35 text-white shadow-md transition-colors hover:bg-black/50 disabled:opacity-40 ${className}`}
    >
      {children}
    </motion.button>
  );
}

// Plays a Creator Hub upload (movie/short = <video>, music = <audio> with a
// cover-art backdrop) inside a watch party room, kept in sync with the rest
// of the room the exact same way TrailerPlayer keeps a YouTube trailer in
// sync: the room's socket state (syncedPlaying / syncedTime / seekVersion)
// is the source of truth, and local taps just *request* a change via
// onRequestPlayPause / onRequestSeek rather than mutating playback directly.
export default function CreatorContentPlayer({
  mediaKind, // "movie" | "music"
  videoUrl,
  audioUrl,
  posterUrl,
  title,
  creatorName,
  onChangeMovie,
  onRequestPlayPause,
  onRequestSeek,
  syncedPlaying,
  syncedTime,
  seekVersion,
}) {
  const mediaRef = useRef(null);
  const applyingRemoteRef = useRef(false);
  const isScrubbingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef(null);

  const src = mediaKind === "music" ? audioUrl : videoUrl;

  // Load the new source and apply whatever the room already agreed on
  // (mirrors TrailerPlayer's onReady: seek to syncedTime, then play/pause).
  useEffect(() => {
    setReady(false);
    const media = mediaRef.current;
    if (!media) return;

    const handleLoadedMetadata = () => {
      setDuration(media.duration || 0);
      if (syncedTime > 0) media.currentTime = syncedTime;
      setReady(true);
      if (syncedPlaying) media.play().catch(() => {});
    };

    media.addEventListener("loadedmetadata", handleLoadedMetadata);
    media.load();

    return () => media.removeEventListener("loadedmetadata", handleLoadedMetadata);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // React to remote play/pause.
  useEffect(() => {
    if (!ready || !mediaRef.current) return;
    applyingRemoteRef.current = true;
    if (syncedPlaying) mediaRef.current.play().catch(() => {});
    else mediaRef.current.pause();
    const t = setTimeout(() => (applyingRemoteRef.current = false), 50);
    return () => clearTimeout(t);
  }, [syncedPlaying, ready]);

  // React to a remote seek. Skipped on first mount — loadedmetadata above
  // already applies the initial position, same as TrailerPlayer's pattern.
  useEffect(() => {
    if (!ready || !mediaRef.current || seekVersion === 0) return;
    applyingRemoteRef.current = true;
    mediaRef.current.currentTime = syncedTime;
    const t = setTimeout(() => (applyingRemoteRef.current = false), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekVersion, ready]);

  // Keep the scrub bar moving during normal playback.
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    const handleTimeUpdate = () => {
      if (!isScrubbingRef.current) setCurrentTime(media.currentTime || 0);
    };
    media.addEventListener("timeupdate", handleTimeUpdate);
    return () => media.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  // Auto-hide chrome after idle, same behaviour as TrailerPlayer.
  useEffect(() => {
    hideTimeoutRef.current = setTimeout(() => setControlsVisible(false), AUTO_HIDE_MS);
    return () => clearTimeout(hideTimeoutRef.current);
  }, []);

  const wakeControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setControlsVisible(false), AUTO_HIDE_MS);
  };

  const togglePlay = () => {
    if (!ready) return;
    onRequestPlayPause(!syncedPlaying);
  };

  const seekBy = (delta) => {
    if (!ready || !mediaRef.current) return;
    const dur = mediaRef.current.duration || Infinity;
    const target = Math.min(dur, Math.max(0, mediaRef.current.currentTime + delta));
    mediaRef.current.currentTime = target;
    setCurrentTime(target);
    onRequestSeek(target);
  };

  const handleTimelineScrub = (t) => {
    isScrubbingRef.current = true;
    setCurrentTime(t);
  };

  const handleTimelineCommit = (t) => {
    isScrubbingRef.current = false;
    if (!mediaRef.current) return;
    mediaRef.current.currentTime = t;
    setCurrentTime(t);
    onRequestSeek(t);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    const next = !muted;
    mediaRef.current.muted = next;
    setMuted(next);
  };

  const handleVolumeChange = (next) => {
    const clamped = Math.min(100, Math.max(0, Math.round(next)));
    setVolumeState(clamped);
    if (mediaRef.current) {
      mediaRef.current.volume = clamped / 100;
      mediaRef.current.muted = clamped === 0;
    }
    setMuted(clamped === 0);
  };

  const showChrome = controlsVisible;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl bg-black"
      onPointerMove={wakeControls}
      onPointerEnter={wakeControls}
      onPointerLeave={() => setControlsVisible(false)}
    >
      {mediaKind === "music" ? (
        <div
          className="flex h-full w-full items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: posterUrl ? `url(${posterUrl})` : undefined }}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-md" />
          <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt=""
                className="h-40 w-40 rounded-2xl object-cover shadow-2xl sm:h-52 sm:w-52"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-white/10 sm:h-52 sm:w-52">
                <Music className="h-12 w-12 text-neutral-500" />
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-white sm:text-lg">{title}</p>
              <p className="text-sm text-neutral-400">{creatorName}</p>
            </div>
          </div>
          <audio ref={mediaRef} src={audioUrl} className="hidden" />
        </div>
      ) : (
        <video
          ref={mediaRef}
          src={videoUrl}
          poster={posterUrl}
          className="h-full w-full object-contain"
          playsInline
        />
      )}

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
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-4"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-white/90 sm:text-base">
                  {title}
                </h3>
                {mediaKind !== "music" && (
                  <p className="truncate text-xs text-white/50">By {creatorName}</p>
                )}
              </div>
              {onChangeMovie && (
                <button
                  onClick={onChangeMovie}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-md hover:bg-white/20"
                >
                  <Shuffle className="h-3 w-3" />
                  Change
                </button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto absolute inset-0 flex items-center justify-center gap-10"
            >
              <CircleButton onClick={() => seekBy(-SEEK_SECONDS)} size={40} disabled={!ready} ariaLabel="Back 10 seconds">
                <span className="flex items-center gap-0.5">
                  <RotateCcw style={{ width: 15, height: 15 }} />
                  <span className="text-[10px] font-bold leading-none">10</span>
                </span>
              </CircleButton>

              <CircleButton
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
              </CircleButton>

              <CircleButton onClick={() => seekBy(SEEK_SECONDS)} size={40} disabled={!ready} ariaLabel="Forward 10 seconds">
                <span className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold leading-none">10</span>
                  <RotateCw style={{ width: 15, height: 15 }} />
                </span>
              </CircleButton>
            </motion.div>

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
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={muted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="h-1 w-[84px] cursor-pointer accent-[#5CF2E3]"
                />
              </div>

              <span className="w-12 shrink-0 text-right text-xs tabular-nums text-white/70">
                {formatTime(currentTime)}
              </span>

              <Timeline
                currentTime={currentTime}
                duration={duration}
                disabled={!ready}
                onScrub={handleTimelineScrub}
                onCommit={handleTimelineCommit}
              />

              <span className="w-14 shrink-0 text-xs tabular-nums text-white/70">
                {formatTime(duration)}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}