import { Film, Tv, User } from "lucide-react";
import MediaCarousel from "./MediaCarousel";

function PersonRow({ people }) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-none">
      {people.map((person) => (
        <div key={person.id} className="w-24 flex-shrink-0 text-center">
          <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-zinc-800 bg-zinc-800">
            {person.photoUrl ? (
              <img src={person.photoUrl} alt={person.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-600">
                <User size={22} />
              </div>
            )}
          </div>
          <p className="mt-2 truncate text-xs text-zinc-300">{person.name}</p>
        </div>
      ))}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Icon size={16} className="text-red-500" />
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
