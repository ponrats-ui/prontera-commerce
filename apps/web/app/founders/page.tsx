"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { foundersApi, type FounderMetrics } from "../../lib/api";
import { ErrorMessage, MetricCard, PageHeader } from "../../components/ui";

const benefits = [
  "Founder Badge",
  "1 Month Pro Free",
  "Founder District Placement",
  "Early Access Features",
  "Founder Recognition",
  "Priority Discovery",
];

export default function FounderLandingPage() {
  const [metrics, setMetrics] = useState<FounderMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    foundersApi
      .metrics()
      .then(setMetrics)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load metrics.",
        ),
      );
  }, []);

  return (
    <main className="content">
      <PageHeader
        eyebrow="Founder Merchant Program"
        title="Founder Merchant 100"
      >
        <Link className="button primary" href="/founders/apply">
          Apply Now
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />
      <div className="grid four">
        <MetricCard
          hint="Current goal"
          label="Founder Merchants"
          value={metrics?.progressLabel ?? "0 / 100"}
        />
        <MetricCard
          hint="Public milestone"
          label="First cohort"
          value={`${metrics?.approvedFounders ?? 0} / 25`}
        />
        <MetricCard hint="Revenue Era" label="Target" value="12 months" />
        <MetricCard
          hint="Example public counter"
          label="Visibility"
          value={metrics?.publicLabel ?? "0 Founders Joined"}
        />
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>What is a Founder Merchant?</h2>
        <p className="muted">
          Founder Merchants are the first businesses invited to help shape
          Prontera Commerce as a Merchant Civilization Platform.
        </p>
      </section>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel">
          <h2>Founder Benefits</h2>
          <div className="grid">
            {benefits.map((benefit) => (
              <div className="card" key={benefit}>
                <span className="badge">{benefit}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Why Join Early?</h2>
          <p>
            Early merchants receive priority recognition, help validate the
            platform, and influence the operating tools, discovery model, and
            world presence merchants will use later.
          </p>
          <p className="muted">
            The first 100 merchants become the foundation of Prontera's Revenue
            Era and Founder District.
          </p>
        </section>
      </div>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel">
          <h2>Merchant Civilization Vision</h2>
          <p>
            Prontera Commerce is not a marketplace clone, MMORPG, metaverse
            project, or social commerce clone.
          </p>
          <p className="muted">
            It is a commerce platform where merchants build a place, customers
            discover districts, and business identity matters.
          </p>
        </section>
        <section className="panel">
          <h2>Apply Now</h2>
          <p className="muted">
            Founder applications are reviewed by the Prontera team before
            Founder status and benefits are activated.
          </p>
          <Link className="button primary" href="/founders/apply">
            Apply Now
          </Link>
        </section>
      </div>
    </main>
  );
}
