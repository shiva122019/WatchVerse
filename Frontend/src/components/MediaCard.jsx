// import { Link } from "react-router-dom";
// import { Play, Film, Tv, Music2 } from "lucide-react";
// import { StarRating } from "@/components/StarRating";

// const typeIcon = {
//   movie: Film,
//   series: Tv,
//   song: Music2,
// };

// export default function MediaCard({ item, width = "w-44 md:w-52" }) {
//   const Icon = typeIcon[item.type] || Film;
//   const isSong = item.type === "song";

//   return (
//     <Link
//       to={`/content/${item.type}/${item.id}`}
//       data-testid={`media-card-${item.id}`}
//       className={`group card-hover relative flex ${width} shrink-0 flex-col`}
//     >
//       <div
//         className={`relative overflow-hidden rounded-xl border border-white/5 bg-neutral-900 ${
//           isSong ? "aspect-square" : "aspect-[2/3]"
//         }`}
//       >
//         <img
//           src={item.cover_url}
//           alt={item.title}
//           loading="lazy"
//           className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />

//         {/* Type badge */}
//         <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur">
//           <Icon className="h-3 w-3 text-[#00F0FF]" />
//           <span
//             className="label-caps text-[9px]"
//             style={{ letterSpacing: "0.2em" }}
//           >
//             {item.type}
//           </span>
//         </div>

//         {/* Song play icon */}
//         {isSong && (
//           <div className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#00F0FF] text-black opacity-0 shadow-lg transition group-hover:opacity-100">
//             <Play className="h-4 w-4 fill-black" />
//           </div>
//         )}

//         {/* Rating chip */}
//         {item.avg_rating > 0 && (
//           <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 backdrop-blur">
//             <StarRating value={item.avg_rating} size={10} />
//             <span className="font-mono-alt text-[10px] text-white">
//               {item.avg_rating.toFixed(1)}
//             </span>
//           </div>
//         )}
//       </div>

//       <div className="mt-3 flex flex-col gap-1">
//         <h3
//           className="line-clamp-1 font-display text-base font-medium text-white"
//           data-testid={`media-card-title-${item.id}`}
//         >
//           {item.title}
//         </h3>
//         <div className="flex items-center gap-2 text-xs text-neutral-400">
//           <span>{item.release_year}</span>
//           <span className="text-neutral-700">·</span>
//           <div className="flex items-center gap-1">
//             {isSong ? (
//               <span className="line-clamp-1">{item.description}</span>
//             ) : item.genres?.length ? (
//               item.genres.slice(0, 3).map((genre, index) => (
//                 <span key={index} className="line-clamp-1">
//                   {genre}
//                   {index < Math.min(item.genres.length, 3) - 1 && (
//                     <span className="text-neutral-700"> · </span>
//                   )}
//                 </span>
//               ))
//             ) : (
//               <span>{item.language}</span>
//             )}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }

// import { Link } from "react-router-dom";
// import { Play, Film, Tv, Music2, Star } from "lucide-react";

// const typeIcon = {
//   movie: Film,
//   series: Tv,
//   song: Music2,
// };

// // Rating pill cycles through an accent set based on score tier, so a row
// // of cards reads with some color variety instead of one flat chip color —
// // same effect as the reference screenshot (gold / pink / green badges).
// function ratingAccent(rating) {
//   if (rating >= 4.6) return "bg-amber-400 text-black";
//   if (rating >= 4.3) return "bg-pink-500 text-white";
//   if (rating >= 4.0) return "bg-emerald-400 text-black";
//   return "bg-[#00F0FF] text-black";
// }

// // Deterministic genre color so the same genre always gets the same pill.
// const GENRE_PALETTE = [
//   "bg-sky-500/15 text-sky-300",
//   "bg-fuchsia-500/15 text-fuchsia-300",
//   "bg-emerald-500/15 text-emerald-300",
//   "bg-amber-500/15 text-amber-300",
//   "bg-rose-500/15 text-rose-300",
//   "bg-violet-500/15 text-violet-300",
// ];

// function genreClass(label) {
//   let hash = 0;
//   for (let i = 0; i < label.length; i++) {
//     hash = label.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   return GENRE_PALETTE[Math.abs(hash) % GENRE_PALETTE.length];
// }

// export default function MediaCard({ item, width = "w-36 md:w-44" }) {
//   const Icon = typeIcon[item.type] || Film;
//   const isSong = item.type === "song";

//   return (
//     <Link
//       to={`/content/${item.type}/${item.id}`}
//       data-testid={`media-card-${item.id}`}
//       className={`group relative flex ${width} shrink-0 flex-col outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0`}
//       style={{ WebkitTapHighlightColor: "transparent" }}
//     >
//       <div
//         className={`relative overflow-hidden rounded-2xl bg-neutral-900 outline-none shadow-none hover:shadow-none focus:shadow-none ${
//           isSong ? "aspect-square" : "aspect-[2/3]"
//         }`}
//       >
//         <img
//           src={item.cover_url}
//           alt={item.title}
//           loading="lazy"
//           className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
//         />
//         {/* Bottom fade — just enough to blend the poster edge into the card
//             background without washing out artwork/text printed on the
//             poster itself. */}
//         <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent" />
//         <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

//         {/* Type badge */}
//         <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-0.5 backdrop-blur">
//           <Icon className="h-2.5 w-2.5 text-[#00F0FF]" />
//           <span
//   className="label-caps"
//   style={{ letterSpacing: "0.15em", fontSize: "9px" }}
// >
//             {item.type}
//           </span>
//         </div>

//         {/* Rating badge — top right, solid accent pill like the reference */}
//         {item.avg_rating > 0 && (
//           <div
//             className={`absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${ratingAccent(
//               item.avg_rating
//             )}`}
//           >
//             <Star className="h-2.5 w-2.5 fill-current" />
//             {item.avg_rating.toFixed(1)}
//           </div>
//         )}

//         {/* Song play icon */}
//         {isSong && (
//           <div className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#00F0FF] text-black opacity-0 shadow-lg transition group-hover:opacity-100">
//             <Play className="h-4 w-4 fill-black" />
//           </div>
//         )}
//       </div>

//       <div className="mt-3 flex flex-col gap-1.5">
//         <h3
//           className="line-clamp-1 font-display text-sm font-medium text-white"
//           data-testid={`media-card-title-${item.id}`}
//         >
//           {item.title}
//         </h3>

//         <div className="flex items-center gap-2 text-xs text-neutral-400">
//           <span className="font-mono-alt">{item.release_year}</span>
//           {isSong && item.description && (
//             <>
//               <span className="text-neutral-700">·</span>
//               <span className="line-clamp-1">{item.description}</span>
//             </>
//           )}
//         </div>

//         {/* Genre pills — separate row, colored per genre, like the reference */}
//         {!isSong && (
//           <div className="mt-0.5 flex flex-wrap gap-1.5">
//             {item.genres?.length ? (
//               item.genres.slice(0, 3).map((genre) => (
//                 <span
//                   key={genre}
//                   className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${genreClass(
//                     genre
//                   )}`}
//                 >
//                   {genre}
//                 </span>
//               ))
//             ) : item.language ? (
//               <span
//                 className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${genreClass(
//                   item.language
//                 )}`}
//               >
//                 {item.language}
//               </span>
//             ) : null}
//           </div>
//         )}
//       </div>
//     </Link>
//   );
// }

import { Link } from "react-router-dom";
import { Play, Film, Tv, Music2, Star } from "lucide-react";

const typeIcon = {
  movie: Film,
  series: Tv,
  song: Music2,
};

// Rating pill cycles through an accent set based on score tier, so a row
// of cards reads with some color variety instead of one flat chip color —
// same effect as the reference screenshot (gold / pink / green badges).
function ratingAccent(rating) {
  if (rating >= 4.6) return "bg-amber-400 text-black";
  if (rating >= 4.3) return "bg-pink-500 text-white";
  if (rating >= 4.0) return "bg-emerald-400 text-black";
  return "bg-[#00F0FF] text-black";
}

// Deterministic genre color so the same genre always gets the same pill.
const GENRE_PALETTE = [
  "bg-sky-500/15 text-sky-300",
  "bg-fuchsia-500/15 text-fuchsia-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
  "bg-violet-500/15 text-violet-300",
];

function genreClass(label) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GENRE_PALETTE[Math.abs(hash) % GENRE_PALETTE.length];
}

/**
 * MediaCard
 * @param {object} item
 * @param {string} width - tailwind width classes applied to the poster
 * @param {number} [rank] - when set (Top 10 Trending row), renders a large
 *   outlined rank number to the left of the poster, matching the height of
 *   the poster only (not the text block below it).
 */
export default function MediaCard({ item, width = "w-36 md:w-44", rank }) {
  const Icon = typeIcon[item.type] || Film;
  const isSong = item.type === "song";

  return (
    <Link
      to={`/content/${item.type}/${item.id}`}
      data-testid={`media-card-${item.id}`}
      className="group relative flex shrink-0 flex-col outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Row: rank number (optional) + poster. items-stretch makes the
          number wrapper match the poster's height exactly, so the number
          never bleeds into the title/genre text below. */}
      <div className="flex items-stretch">
        {rank != null && (
          <div
            className="relative flex shrink-0 items-center justify-center"
            style={{ width: "34px", marginRight: "-18px", zIndex: 0 }}
          >
            <span
              className="select-none font-display font-black leading-none text-transparent"
              style={{
                fontSize: "clamp(56px, 12vw, 88px)",
                WebkitTextStroke: "2px rgba(255,255,255,0.35)",
              }}
            >
              {rank}
            </span>
          </div>
        )}

        <div
          className={`relative z-10 overflow-hidden rounded-2xl bg-neutral-900 outline-none shadow-none hover:shadow-none focus:shadow-none ${width} ${
            isSong ? "aspect-square" : "aspect-[2/3]"
          }`}
        >
          <img
            src={item.cover_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          />
          {/* Bottom fade — just enough to blend the poster edge into the card
              background without washing out artwork/text printed on the
              poster itself. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          {/* Type badge */}
          <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-0.5 backdrop-blur">
            <Icon className="h-2.5 w-2.5 text-[#00F0FF]" />
            <span
              className="label-caps"
              style={{ letterSpacing: "0.15em", fontSize: "9px" }}
            >
              {item.type}
            </span>
          </div>

          {/* Rating badge — top right, solid accent pill like the reference */}
          {item.avg_rating > 0 && (
            <div
              className={`absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${ratingAccent(
                item.avg_rating
              )}`}
            >
              <Star className="h-2.5 w-2.5 fill-current" />
              {item.avg_rating.toFixed(1)}
            </div>
          )}

          {/* Song play icon */}
          {isSong && (
            <div className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#00F0FF] text-black opacity-0 shadow-lg transition group-hover:opacity-100">
              <Play className="h-4 w-4 fill-black" />
            </div>
          )}
        </div>
      </div>

      {/* Text block — aligned under the poster's left edge (not the rank
          number), matching the reference screenshot. */}
      <div
        className={`mt-3 flex flex-col gap-1.5 ${width}`}
        style={rank != null ? { marginLeft: "16px" } : undefined}
      >
        <h3
          className="line-clamp-1 font-display text-sm font-medium text-white"
          data-testid={`media-card-title-${item.id}`}
        >
          {item.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="font-mono-alt">{item.release_year}</span>
          {isSong && item.description && (
            <>
              <span className="text-neutral-700">·</span>
              <span className="line-clamp-1">{item.description}</span>
            </>
          )}
        </div>

        {/* Genre pills — separate row, colored per genre, like the reference */}
        {!isSong && (
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {item.genres?.length ? (
              item.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${genreClass(
                    genre
                  )}`}
                >
                  {genre}
                </span>
              ))
            ) : item.language ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${genreClass(
                  item.language
                )}`}
              >
                {item.language}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
}
