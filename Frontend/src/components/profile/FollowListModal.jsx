import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, User as UserIcon } from "lucide-react";
import api from "@/lib/api";

export default function FollowListModal({ isOpen, onClose, username, type }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !username) return;
    
    let isMounted = true;
    setLoading(true);
    
    // type is either "followers" or "following"
    api.get(`/${type}/${username}`)
      .then((res) => {
        if (isMounted) {
          // The API returns { followers: [...] } or { following: [...] }
          setUsers(res.data[type] || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(`Failed to load ${type}:`, err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, username, type]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="font-display text-xl font-bold capitalize text-white">
                {type}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loading ? (
                <div className="flex py-12 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00F0FF] border-t-transparent" />
                </div>
              ) : users.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  No {type} yet.
                </div>
              ) : (
                <div className="flex flex-col gap-1 p-2">
                  {users.map((u) => (
                    <Link
                      key={u._id || u.username}
                      to={`/profile/${u.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/5"
                    >
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-neutral-400">
                          <UserIcon size={18} />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">
                          {u.displayName || u.username}
                        </div>
                        <div className="text-xs text-neutral-400">
                          @{u.username}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
