import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PrismoLogoMark } from "@/components/PrismoLogo";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (username.trim().length < 2) return setErr("Username too short.");
    if (password.length < 6) return setErr("Password must be 6+ characters.");
    setBusy(true);
    const res = await register(email.trim().toLowerCase(), password, username.trim());
    setBusy(false);
    if (res.ok) navigate("/");
    else setErr(res.error);
  };

  return (
    <div
      className="relative flex min-h-[85vh] items-center justify-center px-6"
      data-testid="register-page"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(255,179,0,0.12), transparent 50%), radial-gradient(circle at 30% 70%, rgba(0,240,255,0.08), transparent 50%)",
        }}
      />
      <form
        onSubmit={onSubmit}
        className="glass relative z-10 w-full max-w-md rounded-2xl p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <PrismoLogoMark size={44} />
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
            Join Prismo
          </h1>
          <p className="text-sm text-neutral-400">
            Track everything you watch, read, and listen to.
          </p>
        </div>

        <label className="label-caps mb-1 block">Display name</label>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          data-testid="register-username-input"
          className="mb-4 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00F0FF]/50 focus:outline-none"
          placeholder="Cinephile"
        />

        <label className="label-caps mb-1 block">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="register-email-input"
          className="mb-4 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00F0FF]/50 focus:outline-none"
          placeholder="you@prismo.app"
        />

        <label className="label-caps mb-1 block">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="register-password-input"
          className="mb-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00F0FF]/50 focus:outline-none"
          placeholder="At least 6 characters"
        />

        {err && (
          <p className="mt-2 text-sm text-[#FF0055]" data-testid="register-error">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          data-testid="register-submit-btn"
          className="mt-6 w-full rounded-full bg-[#FFB300] py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:brightness-110 disabled:opacity-50 amber-glow"
        >
          {busy ? "Creating…" : "Create Account"}
        </button>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link
            to="/login"
            data-testid="register-login-link"
            className="text-[#00F0FF] underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
