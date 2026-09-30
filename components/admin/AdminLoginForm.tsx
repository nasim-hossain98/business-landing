"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, AlertCircle } from "lucide-react";

/**
 * Admin sign-in form.
 *
 * Posts to `POST /api/admin/auth/login`, which validates credentials **and**
 * the admin allow-list server-side before writing the session cookie. A failed
 * attempt never reveals whether the address exists.
 */
export default function AdminLoginForm({ next = "/admin" }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok || !data.ok) {
        setError(data.error ?? "Unable to sign in.");
        setLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="admin-email"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="owner@luxe.com"
          className="w-full rounded-xl border border-stone-700 bg-stone-800/80 px-4 py-3 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-stone-700 bg-stone-800/80 px-4 py-3 pr-11 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 transition-colors hover:text-stone-300"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-stone-950 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
