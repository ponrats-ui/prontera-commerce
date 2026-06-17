"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ErrorMessage } from "../../components/ui";
import { authApi } from "../../lib/api";
import { setAuthSession } from "../../lib/auth";

const initialForm = {
  name: "",
  email: "",
  password: "",
  preferredLocale: "en-US",
  preferredCurrency: "USD",
  countryCode: "US",
  timeZone: "UTC",
};

function authErrorMessage(err: unknown) {
  if (!(err instanceof Error)) {
    return "Registration failed. Please try again.";
  }

  if (err.message === "Failed to fetch") {
    return "Cannot connect to the API. Start the NestJS backend on http://localhost:3000 and try again.";
  }

  return err.message;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register(form);
      setAuthSession(response.accessToken, response.user);
      router.replace("/onboarding");
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
          <h1>Create account</h1>
          <p className="muted">
            Register a local merchant account for dashboard testing.
          </p>
        </div>
        <ErrorMessage message={error} />
        {Object.entries(form).map(([key, value]) => (
          <label key={key}>
            {key}
            <input
              autoComplete={
                key === "email"
                  ? "email"
                  : key === "password"
                    ? "new-password"
                    : "off"
              }
              minLength={key === "password" ? 12 : undefined}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              required
              type={key === "password" ? "password" : "text"}
              value={value}
            />
          </label>
        ))}
        <button className="button primary" disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create account"}
        </button>
        <p className="muted auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
