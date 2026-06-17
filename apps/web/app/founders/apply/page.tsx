"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { foundersApi, type FounderApplicationInput } from "../../../lib/api";
import { ErrorMessage, PageHeader } from "../../../components/ui";

const initialForm: FounderApplicationInput = {
  merchantName: "",
  businessName: "",
  businessType: "",
  category: "",
  website: "",
  facebookPage: "",
  email: "",
  phone: "",
  motivation: "",
};

export default function FounderApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FounderApplicationInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value.trim()),
      ) as FounderApplicationInput;
      const result = await foundersApi.apply(payload);
      setSuccess(result.message);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit application.",
      );
    }
  }

  return (
    <main className="content">
      <PageHeader eyebrow="Founder Merchant Program" title="Apply to Join">
        <Link className="button" href="/founders">
          Back to Program
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />
      {success ? <div className="success">{success}</div> : null}
      <form className="panel form-grid" onSubmit={submit}>
        <div className="form-grid two">
          <label>
            Merchant Name
            <input
              onChange={(event) => update("merchantName", event.target.value)}
              required
              value={form.merchantName}
            />
          </label>
          <label>
            Business Name
            <input
              onChange={(event) => update("businessName", event.target.value)}
              required
              value={form.businessName}
            />
          </label>
          <label>
            Business Type
            <input
              onChange={(event) => update("businessType", event.target.value)}
              placeholder="Computer Store"
              required
              value={form.businessType}
            />
          </label>
          <label>
            Category
            <input
              onChange={(event) => update("category", event.target.value)}
              placeholder="IT Equipment"
              required
              value={form.category}
            />
          </label>
          <label>
            Website
            <input
              onChange={(event) => update("website", event.target.value)}
              placeholder="https://example.com"
              type="url"
              value={form.website}
            />
          </label>
          <label>
            Facebook Page
            <input
              onChange={(event) => update("facebookPage", event.target.value)}
              placeholder="https://facebook.com/example"
              type="url"
              value={form.facebookPage}
            />
          </label>
          <label>
            Contact Email
            <input
              onChange={(event) => update("email", event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label>
            Phone Number
            <input
              onChange={(event) => update("phone", event.target.value)}
              required
              value={form.phone}
            />
          </label>
        </div>
        <label>
          Why do you want to join Prontera?
          <textarea
            minLength={20}
            onChange={(event) => update("motivation", event.target.value)}
            required
            value={form.motivation}
          />
        </label>
        <div className="button-row">
          <button className="button primary" type="submit">
            Submit Application
          </button>
          <Link className="button" href="/founders">
            Review Benefits
          </Link>
        </div>
      </form>
    </main>
  );
}
