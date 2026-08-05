import { Film, Tv, User } from "lucide-react";
import MediaCarousel from "./MediaCarousel";

function PersonRow({ people }) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-none">
      {people.map((person) => (
        <div key={person.id} className="w-24 flex-shrink-0 text-center group cursor-pointer">
          <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-neutral-900 transition-all duration-300 group-hover:border-[#00F0FF] group-hover:scale-105 shadow-inner">
            {person.photoUrl ? (
              <img src={person.photoUrl} alt={person.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-500 bg-white/5 transition-colors group-hover:text-neutral-300">
                <User size={22} />
              </div>
            )}
          </div>
          <p className="mt-2 truncate text-xs text-zinc-400 transition-colors group-hover:text-white font-medium">{person.name}</p>
        </div>
      ))}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6 shadow-xl relative z-10">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Icon size={16} className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function FavoritesTab({ profile }) {
  return (
    <div className="space-y-5">
      <Section title="Favorite Movies" icon={Film}>
        <MediaCarousel items={profile.favoriteMovies} />
      </Section>
      <Section title="Favorite TV Shows" icon={Tv}>
        <MediaCarousel items={profile.favoriteShows} />
      </Section>
      <Section title="Favorite Actors" icon={User}>
        <PersonRow people={profile.favoriteActors} />
      </Section>
      <Section title="Favorite Directors" icon={User}>
        <PersonRow people={profile.favoriteDirectors} />
      </Section>
    </div>
  );
}
