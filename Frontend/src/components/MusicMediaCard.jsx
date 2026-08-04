import { Link } from "react-router-dom";
import { Music2, Play } from "lucide-react";

export default function MusicMediaCard({ item, width = "w-44 md:w-52" }) {
  const formatDuration = (ms) => {
    if (!ms) return "";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <Link
      to={`/content/song/${item.id}`}
      className={`group flex ${width} shrink-0 flex-col`}
      data-testid={`music-card-${item.id}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-neutral-900">
        <img
          src={item.poster || item.cover || item.image}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Music Badge */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur">
          <Music2 className="h-3 w-3 text-[#00F0FF]" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-white">
            Music
          </span>
        </div>

        {/* Play Button */}
        <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#00F0FF] text-black opacity-0 shadow-lg transition group-hover:opacity-100">
          <Play className="h-4 w-4 fill-black" />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <h3 className="line-clamp-1 text-base font-semibold text-white">
          {item.title}
        </h3>

        <p className="line-clamp-1 text-sm text-neutral-300">{item.artist}</p>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {item.album && <span className="line-clamp-1">{item.album}</span>}

          {item.album && item.year && (
            <span className="text-neutral-700">•</span>
          )}

          {item.year && <span>{item.year}</span>}
        </div>

        {item.durationMs && (
          <p className="text-xs text-neutral-500">
            {formatDuration(item.durationMs)}
          </p>
        )}
      </div>
    </Link>
  );
}
