import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Save,
  ArrowLeft,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Disc,
  ListMusic
} from "lucide-react";
import { toast } from "sonner";

export default function Karaoke() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Media metadata
  const [song, setSong] = useState(null);
  const [lyrics, setLyrics] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Audio Playback (Song preview)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Default to 30s Spotify preview
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Audio Recording (User voice)
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [localRecordingUrl, setLocalRecordingUrl] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Playback of local/community recordings
  const [activeRecordingPlayId, setActiveRecordingPlayId] = useState(null);
  const [playingAudioNode, setPlayingAudioNode] = useState(null);

  // Synced Lyrics Scrolling
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);

  // Canvas visualizer & Web Audio
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const backingSourceRef = useRef(null);
  const micSourceRef = useRef(null);
  const mixedDestRef = useRef(null);
  const playerRef = useRef(null);
  const ytContainerRef = useRef(null);
  const [youtubeId, setYoutubeId] = useState(null);
  const [ytReady, setYtReady] = useState(false);

  // Load all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [songRes, recordingsRes] = await Promise.all([
        api.get(`/content/song/${id}`),
        api.get(`/karaoke/recordings/${id}`),
      ]);
      const songData = songRes.data;
      const lowerTitle = (songData.title || "").toLowerCase();
      if (lowerTitle.includes("arz kiya") || lowerTitle.includes("anuv")) {
        songData.preview_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      } else if (lowerTitle.includes("aarzu") || lowerTitle.includes("noor")) {
        songData.preview_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
      }

      setSong(songData);
      setRecordings(recordingsRes.data);

      // Fetch YouTube Video ID
      try {
        const ytRes = await api.get("/karaoke/youtube-video", {
          params: {
            title: songRes.data.title,
            artist: songRes.data.creator,
          },
        });
        setYoutubeId(ytRes.data.videoId);
      } catch (err) {
        console.warn("Could not fetch YouTube ID:", err);
      }

      // Fetch Synced Lyrics
      try {
        const lyricsRes = await api.get("/karaoke/lyrics", {
          params: {
            title: songRes.data.title,
            artist: songRes.data.creator,
          },
        });
        setLyrics(lyricsRes.data);
      } catch (err) {
        console.warn("Could not load synced lyrics:", err);
      }
    } catch (error) {
      toast.error("Failed to load karaoke session details.");
      navigate(`/content/song/${id}`);
    } finally {
      setLoading(false);
    }
  };

  // Load YouTube script and handle page cleanup
  useEffect(() => {
    loadData();

    // Load YouTube script
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    return () => {
      stopRecording();
      stopVisualizer();
      if (playingAudioNode) playingAudioNode.pause();
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // YouTube Player Initialization
  const initYoutubePlayer = (videoId) => {
    if (!window.YT || !window.YT.Player) {
      setTimeout(() => initYoutubePlayer(videoId), 300);
      return;
    }

    if (!ytContainerRef.current) return;

    // Clean up existing player if it exists to ensure a clean state
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn("Error destroying previous YouTube player:", e);
      }
      playerRef.current = null;
    }

    setYtReady(false);

    try {
      playerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1, // Let user control it
          disablekb: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            setYtReady(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              if (playingAudioNode) {
                playingAudioNode.pause();
                setActiveRecordingPlayId(null);
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleAudioEnded();
            }
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize YouTube Player:", err);
    }
  };

  useEffect(() => {
    if (youtubeId) {
      initYoutubePlayer(youtubeId);
    }
  }, [youtubeId]);

  // YouTube Timeline Sync Timer
  useEffect(() => {
    let interval;
    if (isPlaying && youtubeId && playerRef.current && playerRef.current.getCurrentTime) {
      interval = setInterval(() => {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          const dur = playerRef.current.getDuration();
          if (dur) setDuration(dur);
        } catch (e) {}
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, youtubeId]);

  // Handle Synced Lyrics Highlighting
  useEffect(() => {
    if (lyrics.length === 0) return;
    
    // Find index of the lyric line corresponding to the currentTime
    let activeIndex = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
    setActiveLyricIndex(activeIndex);

    // Scroll active lyric line to center of container
    if (activeIndex !== -1 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeElement = container.children[activeIndex];
      if (activeElement) {
        const containerHeight = container.clientHeight;
        const elemTop = activeElement.offsetTop;
        const elemHeight = activeElement.clientHeight;
        container.scrollTo({
          top: elemTop - containerHeight / 2 + elemHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentTime, lyrics]);

  // Audio Timeline Tracking
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (isRecording) {
      handleStopRecording();
    }
  };

  const togglePlayback = () => {
    // Prioritize HTML5 audio if present
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (playingAudioNode) {
          playingAudioNode.pause();
          setActiveRecordingPlayId(null);
        }
        audioRef.current.play().catch((err) => {
          console.warn("Playback failed:", err);
          toast.error("Playback failed. Make sure your browser allows audio autoplay.");
        });
        setIsPlaying(true);
      }
      return;
    }

    if (youtubeId && playerRef.current && typeof playerRef.current.playVideo === "function" && typeof playerRef.current.pauseVideo === "function") {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        if (playingAudioNode) {
          playingAudioNode.pause();
          setActiveRecordingPlayId(null);
        }
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }
  };

  const toggleMute = () => {
    if (youtubeId && playerRef.current && typeof playerRef.current.isMuted === "function" && typeof playerRef.current.mute === "function" && typeof playerRef.current.unMute === "function") {
      if (playerRef.current.isMuted()) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
      return;
    }

    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Web Audio API visualizer for mic stream
  const startVisualizer = (stream) => {
    try {
      const analyser = analyserRef.current;
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      const draw = () => {
        if (!analyserRef.current) return;
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "rgba(10, 10, 10, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.6;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

          // Draw dual-sided colorful glow bars
          const grad = ctx.createLinearGradient(
            0,
            canvas.height / 2 - barHeight / 2,
            0,
            canvas.height / 2 + barHeight / 2
          );
          grad.addColorStop(0, "#00F0FF");
          grad.addColorStop(0.5, "#8000FF");
          grad.addColorStop(1, "#FF007F");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height / 2 - barHeight / 2, barWidth - 2, barHeight, 4);
          ctx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn("Visualizer failed to draw", e);
    }
  };

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (micSourceRef.current) {
      try {
        micSourceRef.current.disconnect();
      } catch (e) {}
      micSourceRef.current = null;
    }
    if (mixedDestRef.current) {
      mixedDestRef.current = null;
    }
    analyserRef.current = null;
  };

  // MediaRecorder Recording Handlers
  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Your browser does not support audio recording.");
      return;
    }

    // PLAY BACKING TRACK SYNCHRONOUSLY FIRST to guarantee browser allows playback!
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Audio autoplay failed or blocked:", err);
      });
      setIsPlaying(true);
    } else if (youtubeId && playerRef.current && typeof playerRef.current.playVideo === "function") {
      try {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      } catch (e) {
        console.warn("YouTube play error:", e);
      }
      setIsPlaying(true);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 1. Initialize AudioContext
      const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // 2. Initialize Analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      // 3. Initialize Mic Source
      const micSource = audioContext.createMediaStreamSource(stream);
      micSourceRef.current = micSource;
      micSource.connect(analyser); // Connect mic only to analyser to visualize voice (no feedback)

      // 4. Setup mixed stream recording (mic + backing music)
      let recordStream = stream;

      if (audioRef.current && song.preview_url) {
        try {
          // Create backing source node only once
          if (!backingSourceRef.current) {
            backingSourceRef.current = audioContext.createMediaElementSource(audioRef.current);
            backingSourceRef.current.connect(audioContext.destination); // Connect to speakers
          }

          // Create mixed stream destination
          const dest = audioContext.createMediaStreamDestination();
          mixedDestRef.current = dest;

          // Connect both signals to destination stream
          micSource.connect(dest);
          backingSourceRef.current.connect(dest);

          recordStream = dest.stream;
        } catch (err) {
          console.warn("Could not mix backing track into recording:", err);
        }
      }

      // 5. Setup MediaRecorder with either the mixed or raw mic stream
      const options = { mimeType: "audio/webm" };
      let recorder;
      try {
        recorder = new MediaRecorder(recordStream, options);
      } catch (e) {
        recorder = new MediaRecorder(recordStream);
      }

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        setLocalRecordingUrl(URL.createObjectURL(blob));
      };

      // Reset states
      setRecordedBlob(null);
      setLocalRecordingUrl(null);
      setRecordingDuration(0);
      setIsRecording(true);

      // Start recording
      recorder.start();
      startVisualizer();

      // Reset current time to 0 when starting recording
      setCurrentTime(0);

      // Start recording duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const next = prev + 1;
          setCurrentTime(next); // Sync lyrics scrolling with the recording elapsed time!
          return next;
        });
      }, 1000);

      toast.success("Recording started! Sing along to the lyrics!");
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied or error starting recorder.");
    }
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    clearInterval(recordingTimerRef.current);
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    // Stop microphone stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    stopVisualizer();

    // Pause music backing track (HTML5 audio prioritized, then YouTube)
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (youtubeId && playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      try {
        playerRef.current.pauseVideo();
      } catch (e) {}
      setIsPlaying(false);
    }

    toast.info("Recording finished. You can play back your take below!");
  };

  const stopRecording = () => {
    clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSaveRecording = async () => {
    if (!recordedBlob) return;

    const loadingToast = toast.loading("Saving your recording to Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("audio", recordedBlob, "karaoke-take.webm");
      formData.append("songId", id);
      formData.append("songTitle", song.title);
      formData.append("songArtist", song.creator);
      formData.append("duration", recordingDuration || 30);

      const res = await api.post("/karaoke/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss(loadingToast);
      toast.success("Cover saved successfully!");
      
      // Reload recordings list
      const recordingsRes = await api.get(`/karaoke/recordings/${id}`);
      setRecordings(recordingsRes.data);

      // Reset local take
      setRecordedBlob(null);
      setLocalRecordingUrl(null);
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(formatApiError(e.response?.data?.error) || "Failed to save cover.");
    }
  };

  const handleDeleteLocalTake = () => {
    setRecordedBlob(null);
    setLocalRecordingUrl(null);
    setRecordingDuration(0);
    toast.info("Recording discarded.");
  };

  // Playback of past / community recordings
  const togglePlayRecording = (rec) => {
    if (activeRecordingPlayId === rec._id) {
      // Pause vocals
      playingAudioNode.pause();
      setActiveRecordingPlayId(null);
      
      // Pause YouTube too
      if (youtubeId && playerRef.current && typeof playerRef.current.pauseVideo === "function") {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
    } else {
      // Stop anything else playing
      if (isPlaying) {
        if (youtubeId && playerRef.current && typeof playerRef.current.pauseVideo === "function") {
          try {
            playerRef.current.pauseVideo();
          } catch (e) {}
        } else if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }
      if (playingAudioNode) {
        playingAudioNode.pause();
      }

      const audio = new Audio(rec.audioUrl);

      // Play YouTube video in sync
      if (youtubeId && playerRef.current && typeof playerRef.current.playVideo === "function") {
        try {
          playerRef.current.seekTo(0);
          playerRef.current.playVideo();
        } catch (e) {}
      }

      audio.play().catch(() => {
        toast.error("Could not play recording.");
      });
      setPlayingAudioNode(audio);
      setActiveRecordingPlayId(rec._id);

      audio.onended = () => {
        setActiveRecordingPlayId(null);
        if (youtubeId && playerRef.current && typeof playerRef.current.pauseVideo === "function") {
          try {
            playerRef.current.pauseVideo();
          } catch (e) {}
        }
      };
    }
  };

  const handleDeleteRecording = async (recId) => {
    if (!window.confirm("Are you sure you want to delete this recording?")) return;

    try {
      await api.delete(`/karaoke/recordings/${recId}`);
      toast.success("Recording deleted.");
      setRecordings((prev) => prev.filter((r) => r._id !== recId));
      if (activeRecordingPlayId === recId) {
        playingAudioNode.pause();
        setActiveRecordingPlayId(null);
      }
    } catch (e) {
      toast.error("Failed to delete recording.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-neutral-500">
        Initializing Karaoke Studio...
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-neutral-400">
        Song not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 pb-24 text-white">
      {/* Back button */}
      <button
        onClick={() => navigate(`/content/song/${id}`)}
        className="mb-8 flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Song Details
      </button>

      {/* Grid: Player & Metadata Left, Synced Lyrics Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Song Info & Recording Board */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Glassy Metadata Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md shadow-xl flex flex-col items-center text-center">
            {/* YouTube player container (always in DOM, visible only when youtubeId is present) */}
            <div className={`relative mb-4 w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black flex items-center justify-center ${youtubeId ? "block" : "hidden"}`}>
              {/* Cover Art as Placeholder/Background while YouTube loads */}
              {!ytReady && (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="absolute inset-0 h-full w-full object-cover blur-sm opacity-50"
                />
              )}
              {/* YouTube player element */}
              <div 
                ref={ytContainerRef} 
                className={`w-full h-full ${ytReady ? "block" : "hidden"}`} 
              />
              {!ytReady && (
                <div className="absolute text-xs text-neutral-400 font-medium animate-pulse">
                  Loading audio player...
                </div>
              )}
            </div>

            {/* Standard Cover Art (visible only when youtubeId is NOT present) */}
            <div className={`relative mb-4 w-40 h-40 rounded-xl overflow-hidden shadow-2xl border border-white/10 group ${!youtubeId ? "block" : "hidden"}`}>
              <img
                src={song.cover_url}
                alt={song.title}
                className={`h-full w-full object-cover ${isPlaying || isRecording ? "animate-spin" : ""}`}
                style={{ animationDuration: "12s" }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Disc className="h-10 w-10 text-[#00F0FF]" />
              </div>
            </div>
            
            <h1 className="font-display text-2xl font-semibold leading-tight text-white">
              {song.title}
            </h1>
            <p className="mt-1 text-sm text-neutral-400 font-medium">
              {song.creator}
            </p>
            <p className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-neutral-400">
              {song.description}
            </p>

            {/* Spotify Embed Player (Plays 30s preview exactly like the normal detail page) */}
            <div className="mt-4 w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-lg">
              <iframe
                src={`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Preview: ${song.title}`}
                className="rounded-xl"
              />
            </div>

            {/* HTML5 backing player */}
            {song.preview_url && (
              <audio
                ref={audioRef}
                src={song.preview_url}
                crossOrigin="anonymous"
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={(e) => setDuration(e.target.duration)}
                onEnded={handleAudioEnded}
              />
            )}
            {!song.preview_url && (
              <div className="mt-4 text-xs text-yellow-500/80 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg">
                ⚠️ Backing track preview is unavailable. You can still record your voice.
              </div>
            )}
            
            {/* Backing Track Controls */}
            {(youtubeId || song.preview_url) && (
              <div className="mt-6 flex w-full items-center justify-between border-t border-white/5 pt-4">
                <button
                  onClick={togglePlayback}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                  title={isPlaying ? "Pause track" : "Play backing track"}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 text-[#00F0FF]" />
                  ) : (
                    <Play className="h-4 w-4 fill-white text-white" />
                  )}
                </button>

                {/* Progress bar */}
                <div className="flex-1 mx-4">
                  <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00F0FF] to-[#8000FF] transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between font-mono-alt text-[10px] text-neutral-500">
                    <span>
                      {Math.floor(currentTime / 60)}:
                      {Math.floor(currentTime % 60).toString().padStart(2, "0")}
                    </span>
                    <span>
                      {Math.floor(duration / 60)}:
                      {Math.floor(duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleMute}
                  className="flex h-8 w-8 items-center justify-center text-neutral-400 hover:text-white transition"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Recording Console */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md shadow-xl flex flex-col items-center">
            <h2 className="w-full text-left font-display text-lg font-semibold border-b border-white/5 pb-2 mb-4">
              Recording Board
            </h2>

            {/* Canvas Visualizer Display */}
            <div className="relative h-32 w-full overflow-hidden rounded-xl border border-white/5 bg-black/60 shadow-inner flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={360}
                height={128}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {!isRecording && !localRecordingUrl && (
                <div className="z-10 flex flex-col items-center text-center text-neutral-500 gap-1.5">
                  <Mic className="h-7 w-7 animate-pulse text-[#00F0FF]/60" />
                  <p className="text-xs">Microphone is idle</p>
                </div>
              )}
              {isRecording && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-red-600/20 border border-red-600/30 px-2.5 py-0.5 text-[10px] text-red-500 font-bold uppercase tracking-wider animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  Rec {Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, "0")}
                </div>
              )}
            </div>

            {/* Rec buttons */}
            <div className="mt-6 flex w-full justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF007F] hover:bg-[#FF007F]/90 px-5 py-3 text-sm font-bold text-white shadow-lg transition"
                >
                  <Mic className="h-4 w-4" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white text-black hover:brightness-90 px-5 py-3 text-sm font-bold shadow-lg transition"
                >
                  <Square className="h-4 w-4 fill-black" />
                  Stop Recording
                </button>
              )}
            </div>

            {/* Local Take Management */}
            {localRecordingUrl && (
              <div className="mt-6 w-full rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/5 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-[#00F0FF] font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    Local Performance Take
                  </span>
                  <button
                    onClick={handleDeleteLocalTake}
                    className="text-neutral-400 hover:text-[#FF0055] transition"
                    title="Discard take"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Local audio playback bar */}
                <audio
                  src={localRecordingUrl}
                  controls
                  className="h-8 w-full outline-none opacity-80"
                />

                <button
                  onClick={handleSaveRecording}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#00F0FF] px-4 py-2.5 text-sm font-bold text-black hover:brightness-110 shadow-md transition"
                >
                  <Save className="h-4 w-4" />
                  Save Cover to Cloudinary
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Lyrics Box */}
        <div className="md:col-span-7 flex flex-col h-[520px] rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.01] px-6 py-4">
            <span className="flex items-center gap-2 font-display font-semibold text-white">
              <Sparkles className="h-4 w-4 text-[#00F0FF]" />
              Synced Karaoke Lyrics
            </span>
            <span className="font-mono-alt text-xs text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/20 px-2.5 py-0.5 rounded-full">
              Gemini Powered
            </span>
          </div>

          {/* Scrolling Lyrics Area */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto px-6 py-20 flex flex-col gap-8 scroll-smooth select-none scrollbar-thin"
            style={{
              maskImage: "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)",
            }}
          >
            {lyrics.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-sm text-neutral-500 py-12">
                No lyrics synced for this song. Go ahead and hum along!
              </div>
            ) : (
              lyrics.map((l, index) => {
                const isActive = index === activeLyricIndex;
                const isPassed = index < activeLyricIndex;
                return (
                  <p
                    key={index}
                    className={`text-center font-display font-medium text-lg leading-relaxed transition-all duration-300 ${
                      isActive
                        ? "text-[#00F0FF] scale-110 font-bold drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                        : isPassed
                        ? "text-neutral-500 line-through decoration-neutral-600/30"
                        : "text-neutral-400"
                    }`}
                  >
                    {l.text}
                  </p>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Community Cover Recordings Section */}
      <section className="mt-16 border-t border-white/10 pt-10">
        <div className="mb-6 flex items-center gap-2.5">
          <ListMusic className="h-5 w-5 text-[#00F0FF]" />
          <h2 className="font-display text-2xl font-bold text-white">
            Community Recordings
          </h2>
        </div>

        {recordings.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-10 text-center text-sm text-neutral-500">
            No covers recorded yet. Be the first to record and show your talent!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recordings.map((rec) => {
              const isPlayingRec = activeRecordingPlayId === rec._id;
              const isMine = user && rec.userId === user.id;
              return (
                <div
                  key={rec._id}
                  className={`rounded-xl border p-4 backdrop-blur-sm flex items-center justify-between transition-all ${
                    isPlayingRec
                      ? "border-[#00F0FF] bg-[#00F0FF]/5 shadow-lg"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlayRecording(rec)}
                      className={`h-9 w-9 flex items-center justify-center rounded-full transition ${
                        isPlayingRec
                          ? "bg-[#00F0FF] text-black"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      {isPlayingRec ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                      )}
                    </button>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {rec.username}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-neutral-500 font-mono-alt uppercase">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {rec.duration}s
                        </span>
                        <span>•</span>
                        <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {isMine && (
                    <button
                      onClick={() => handleDeleteRecording(rec._id)}
                      className="text-neutral-500 hover:text-[#FF0055] p-2 rounded-full hover:bg-white/5 transition"
                      title="Delete recording"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
