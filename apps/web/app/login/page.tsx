"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authApi } from "../../lib/api";
import { setAuthSession } from "../../lib/auth";
import { ErrorMessage } from "../../components/ui";

function authErrorMessage(err: unknown) {
  if (!(err instanceof Error)) {
    return "Login failed. Please try again.";
  }

  if (err.message === "Failed to fetch") {
    return "Cannot connect to the API. Start the NestJS backend on http://localhost:3000 and try again.";
  }

  return err.message;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      setAuthSession(response.accessToken, response.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card form-grid" onSubmit={submit}>
        <div>
          <p className="eyebrow">Merchant OS</p>
          <h1>Login</h1>
          <p className="muted">Use your Prontera Commerce merchant account.</p>
        </div>
        <div className="demo-callout">
          <p className="eyebrow">Demo account</p>
          <p>demo@prontera.local</p>
          <p className="muted">Password: DemoPass123!</p>
        </div>
        <ErrorMessage message={error} />
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <button className="button primary" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="muted auth-switch">
          Need a local account? <Link href="/register">Create one</Link>
        </p>
      </form>
    </main>
  );
}
