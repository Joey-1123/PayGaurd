"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { login } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      useAuthStore.getState().setUser(email);
      router.replace("/");
    } catch {
      setError("Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-6 p-8">
        <div className="space-y-2 text-center">
          <ShieldCheck className="mx-auto size-8 text-ink" />
          <h1 className="text-2xl font-bold tracking-tight text-ink">PayGuard</h1>
          <p className="label">Sign in to the demo dashboard</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="block w-full rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-ink/40"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="block w-full rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-ink/40"
            required
          />
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-xs text-faint">
          Demo: demo@payguard.io
        </p>
      </form>
    </main>
  );
}