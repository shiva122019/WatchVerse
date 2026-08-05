import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PrismoLogoMark } from "@/components/PrismoLogo";
import { API } from "@/lib/api";

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
    const res = await register(
      email.trim().toLowerCase(),
      password,
      username.trim(),
    );
    setBusy(false);
    if (res.ok) navigate("/onBoarding");
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
          <p
            className="mt-2 text-sm text-[#FF0055]"
            data-testid="register-error"
          >
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
        {/* Divider */}
        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-widest text-neutral-500">
            or
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={() => {
            window.location.href = `${API}/auth/google`;
          }}
          data-testid="login-google-btn"
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
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
