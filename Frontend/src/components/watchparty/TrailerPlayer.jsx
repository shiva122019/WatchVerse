import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Settings, RotateCcw, RotateCw } from "lucide-react";

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
const ZOOM_PERCENT = 145;

// How far a single tap on the skip buttons moves playback.
const SEEK_SECONDS = 10;

export default function TrailerPlayer({
  trailerKey,
  posterUrl,
  onChangeMovie,
  onRequestPlayPause,
  onRequestSeek,
  syncedPlaying,
  syncedTime,
  seekVersion,
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
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQuality] = useState("auto");
  // Whether real playback has ever started for this trailer — used only
  // to decide whether the cover shows "Loading trailer…" (first time) or
  // just the plain play icon (every pause after that).
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

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
          // Stops YouTube's own captions track from auto-loading — the
          // burned-in subtitles you saw were coming from here, not from
          // anything we render.
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            setReady(true);
            if (syncedTime > 0) e.target.seekTo(syncedTime, true);
            if (!syncedPlaying) e.target.pauseVideo();
          },
          onStateChange: (e) => {
            if (cancelled) return;
            // Real playback has begun (past any studio bumper / buffering) —
            // switches the cover from "Loading trailer…" to a plain play
            // icon on future pauses (see cover logic below).
            if (e.data === YT.PlayerState.PLAYING) setHasStartedPlaying(true);
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
    const duration = playerRef.current.getDuration() || Infinity;
    const target = Math.min(duration, Math.max(0, current + delta));
    playerRef.current.seekTo(target, true);
    onRequestSeek(target);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    muted ? playerRef.current.unMute() : playerRef.current.mute();
    setMuted((m) => !m);
  };

  const setQualityLevel = (level) => {
    playerRef.current?.setPlaybackQuality(level);
    setQuality(level);
    setShowQuality(false);
  };

  // Covers the raw iframe any time it's not actively playing. This is the
  // key piece: YouTube renders its own branded "paused" screen (title,
  // channel avatar, endscreen suggestions, its logo, its own mini
  // controls, burned-in captions on the paused frame) any time the video
  // isn't playing — regardless of controls/modestbranding params — so the
  // only reliable way to hide it is to physically sit an opaque layer on
  // top of the iframe whenever we're paused, not just before first play.
  const showCover = !ready || !syncedPlaying;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black">
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

      {/* Full-frame tap target (handles taps while the video is actually
          visible and playing, i.e. when the cover below is hidden) */}
      <button
        onClick={togglePlay}
        disabled={!ready}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Toggle play"
      />

      {/* Cover — opaque any time we're not playing, so none of YouTube's
          own paused-state UI (title, channel, logo, endscreen, captions)
          is ever visible, only our own poster + play icon. */}
      <button
        onClick={togglePlay}
        disabled={!ready}
        aria-label={ready ? "Play" : "Loading"}
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black transition-opacity duration-300 ${
          showCover ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {posterUrl && (
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
        <div className="relative flex flex-col items-center gap-3">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-lg backdrop-blur-xl ${
              !ready ? "animate-pulse" : ""
            }`}
          >
            <Play className="ml-1 h-7 w-7 text-white/90" />
          </div>
          {!hasStartedPlaying && (
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {ready ? "Tap to play" : "Loading trailer…"}
            </p>
          )}
        </div>
      </button>

      {/* Custom control bar — floating frosted glass clusters */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1.5 shadow-lg backdrop-blur-xl">
          <button
            onClick={() => seekBy(-SEEK_SECONDS)}
            disabled={!ready}
            className="relative rounded-full p-2 text-white/90 transition hover:bg-white/15 disabled:opacity-40"
            aria-label="Back 10 seconds"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-semibold">
              10
            </span>
          </button>

          <button
            onClick={togglePlay}
            disabled={!ready}
            className="rounded-full p-2 text-white/90 transition hover:bg-white/15 disabled:opacity-40"
          >
            {syncedPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button
            onClick={() => seekBy(SEEK_SECONDS)}
            disabled={!ready}
            className="relative rounded-full p-2 text-white/90 transition hover:bg-white/15 disabled:opacity-40"
            aria-label="Forward 10 seconds"
          >
            <RotateCw className="h-4 w-4" />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-semibold">
              10
            </span>
          </button>

          <button
            onClick={toggleMute}
            disabled={!ready}
            className={`rounded-full p-2 transition hover:bg-white/15 disabled:opacity-40 ${
              muted ? "text-white/90" : "text-[#5CF2E3]"
            }`}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowQuality((s) => !s)}
              className="rounded-full border border-white/15 bg-white/10 p-2.5 text-white/90 shadow-lg backdrop-blur-xl transition hover:bg-white/15"
            >
              <Settings className="h-4 w-4" />
            </button>
            {showQuality && (
              <div className="absolute bottom-12 right-0 w-32 rounded-xl border border-white/15 bg-white/10 p-1 shadow-xl backdrop-blur-xl">
                {["hd1080", "hd720", "large", "medium", "auto"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQualityLevel(q)}
                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs hover:bg-white/10 ${
                      quality === q ? "text-[#5CF2E3]" : "text-white/60"
                    }`}
                  >
                    {q === "auto" ? "Auto" : q.replace("hd", "") + "p"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onChangeMovie}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white/90 shadow-lg backdrop-blur-xl transition hover:bg-white/15"
          >
            Change movie
          </button>
        </div>
      </div>
    </div>
  );
}