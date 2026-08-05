 import { Crown } from "lucide-react";

function initials(name = "") {
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

export default function ParticipantsList({ people = [] }) {
  if (!people.length) {
    return (
      <p className="px-4 py-6 text-sm text-neutral-500">
        No one's here yet — share the link to bring people in.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 px-2 py-3">
      {people.map((p) => (
        <li
          key={p.id}
          className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-black"
            style={{ backgroundColor: p.color || "#5CF2E3" }}
          >
            {initials(p.name)}
          </span>

          <span className="flex-1 truncate text-sm text-neutral-200">{p.name}</span>

          {p.isHost && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black"
              style={{ backgroundColor: "#5CF2E3" }}
              title="Host"
            >
              <Crown className="h-3 w-3" />
              Host
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
