import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPanel({ messages = [], myName, onSend }) {
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const submit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="mt-6 text-center text-sm text-neutral-500">
            No messages yet. Say hi 👋
          </p>
        )}

        {messages.map((m) => {
          const mine = m.name === myName;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="mb-1 px-1 text-[11px] text-neutral-500">
                {mine ? "You" : m.name} · {formatTime(m.ts)}
              </span>
              <span
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "text-black" : "bg-white/5 text-neutral-100"
                }`}
                style={mine ? { backgroundColor: "#5CF2E3" } : undefined}
              >
                {m.text}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Send a message"
          maxLength={500}
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#5CF2E3]/50"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black disabled:opacity-30"
          style={{ backgroundColor: "#5CF2E3" }}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
