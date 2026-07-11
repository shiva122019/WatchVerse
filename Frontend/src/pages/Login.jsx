import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PrismoLogoMark } from "@/components/PrismoLogo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await login(email.trim().toLowerCase(), password);
    setBusy(false);
    if (res.ok) navigate("/");
    else setErr(res.error);
  };

  return (
    <div
      className="relative flex min-h-[85vh] items-center justify-center px-6"
      data-testid="login-page"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(0,240,255,0.12), transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,179,0,0.08), transparent 50%)",
        }}
      />
      <form
        onSubmit={onSubmit}
        className="glass relative z-10 w-full max-w-md rounded-2xl p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <PrismoLogoMark size={44} />
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-400">
            Sign in to continue your journey.
          </p>
        </div>

        <label className="label-caps mb-1 block">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="login-email-input"
          className="mb-4 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00F0FF]/50 focus:outline-none"
          placeholder="you@prismo.app"
        />

        <label className="label-caps mb-1 block">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="login-password-input"
          className="mb-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#00F0FF]/50 focus:outline-none"
          placeholder="••••••••"
        />

        {err && (
          <p className="mt-2 text-sm text-[#FF0055]" data-testid="login-error">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          data-testid="login-submit-btn"
          className="mt-6 w-full rounded-full bg-[#00F0FF] py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>

        <p className="mt-6 text-center text-sm text-neutral-400">
          New here?{" "}
          <Link
            to="/register"
            data-testid="login-register-link"
            className="text-[#00F0FF] underline underline-offset-4"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
