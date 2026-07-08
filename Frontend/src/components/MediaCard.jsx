import { Link } from "react-router-dom";
import { Play, Film, Tv, Music2 } from "lucide-react";
import { StarRating } from "@/components/StarRating";

const typeIcon = {
  movie: Film,
  series: Tv,
  song: Music2,
};

export default function MediaCard({ item, width = "w-44 md:w-52" }) {
  const Icon = typeIcon[item.type] || Film;
  const isSong = item.type === "song";

  return (
    <Link
      to={`/content/${item.id}`}
      data-testid={`media-card-${item.id}`}
      className={`group card-hover relative flex ${width} shrink-0 flex-col`}
    >
      <div
        className={`relative overflow-hidden rounded-xl border border-white/5 bg-neutral-900 ${
          isSong ? "aspect-square" : "aspect-[2/3]"
        }`}
      >
        <img
          src={item.cover_url}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />

        {/* Type badge */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur">
          <Icon className="h-3 w-3 text-[#00F0FF]" />
          <span className="label-caps text-[9px]" style={{ letterSpacing: "0.2em" }}>
            {item.type}
          </span>
        </div>

        {/* Song play icon */}
        {isSong && (
          <div className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#00F0FF] text-black opacity-0 shadow-lg transition group-hover:opacity-100">
            <Play className="h-4 w-4 fill-black" />
          </div>
        )}

        {/* Rating chip */}
        {item.avg_rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 backdrop-blur">
            <StarRating value={item.avg_rating} size={10} />
            <span className="font-mono-alt text-[10px] text-white">
              {item.avg_rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <h3
          className="line-clamp-1 font-display text-base font-medium text-white"
          data-testid={`media-card-title-${item.id}`}
        >
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>{item.release_year}</span>
          <span className="text-neutral-700">·</span>
          <span className="line-clamp-1">{item.genres?.[0] || item.language}</span>
        </div>
      </div>
    </Link>
  );
}