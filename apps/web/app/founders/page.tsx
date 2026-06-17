"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
  const [message, setMessage] = useState<string | null>(null);
  const [waitlist, setWaitlist] = useState({
    merchantName: "",
    businessName: "",
    email: "",
    category: "",
  });
  const [referral, setReferral] = useState({
    referrerEmail: "",
    referredEmail: "",
  });

  useEffect(() => {
    foundersApi
      .campaign()
      .then((data) => {
        setMetrics(data);
        void foundersApi.track({
          eventType: "LANDING_VIEW",
          source: "founders-page",
          campaign: "founder-launch",
        });
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load metrics.",
        ),
      );
  }, []);

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const result = await foundersApi.waitlist({
        ...waitlist,
        source: "founders-page",
      });
      setMetrics(result.founderCounter);
      setMessage(result.message);
      setWaitlist({
        merchantName: "",
        businessName: "",
        email: "",
        category: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join waitlist.");
    }
  }

  async function submitReferral(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const result = await foundersApi.refer(referral);
      setMessage(`${result.message} Code: ${result.referral.referralCode}`);
      setReferral({ referrerEmail: "", referredEmail: "" });
      setMetrics(await foundersApi.campaign());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to capture referral.",
      );
    }
  }

  return (
    <main className="content">
      <PageHeader
        eyebrow="Founder Merchant Program"
        title="Founder Merchant 100"
      >
        <Link
          className="button primary"
          href="/founders/apply"
          onClick={() =>
            void foundersApi.track({
              eventType: "APPLY_CLICK",
              source: "founders-page",
              campaign: "founder-launch",
            })
          }
        >
          Apply Now
        </Link>
      </PageHeader>
      <ErrorMessage message={error} />
      {message ? <div className="success">{message}</div> : null}
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
          hint="Founder counter"
          label="Visibility"
          value={metrics?.publicLabel ?? "0 Founders Joined"}
        />
        <MetricCard
          hint="Warm leads"
          label="Waitlist"
          value={metrics?.waitlistCount ?? 0}
        />
        <MetricCard
          hint="Founder referrals"
          label="Referrals"
          value={metrics?.referralCount ?? 0}
        />
        <MetricCard
          hint="Landing to application"
          label="Conversion"
          value={`${metrics?.founderConversionRate ?? 0}%`}
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
          <h2>Join Founder Waitlist</h2>
          <form className="form-grid" onSubmit={joinWaitlist}>
            <input
              onChange={(event) =>
                setWaitlist((current) => ({
                  ...current,
                  merchantName: event.target.value,
                }))
              }
              placeholder="Merchant name"
              required
              value={waitlist.merchantName}
            />
            <input
              onChange={(event) =>
                setWaitlist((current) => ({
                  ...current,
                  businessName: event.target.value,
                }))
              }
              placeholder="Business name"
              required
              value={waitlist.businessName}
            />
            <input
              onChange={(event) =>
                setWaitlist((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="Contact email"
              required
              type="email"
              value={waitlist.email}
            />
            <input
              onChange={(event) =>
                setWaitlist((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              placeholder="Category"
              required
              value={waitlist.category}
            />
            <button className="button primary" type="submit">
              Join Waitlist
            </button>
          </form>
        </section>
        <section className="panel">
          <h2>Refer a Merchant</h2>
          <form className="form-grid" onSubmit={submitReferral}>
            <input
              onChange={(event) =>
                setReferral((current) => ({
                  ...current,
                  referrerEmail: event.target.value,
                }))
              }
              placeholder="Your email"
              required
              type="email"
              value={referral.referrerEmail}
            />
            <input
              onChange={(event) =>
                setReferral((current) => ({
                  ...current,
                  referredEmail: event.target.value,
                }))
              }
              placeholder="Merchant email to invite"
              required
              type="email"
              value={referral.referredEmail}
            />
            <button className="button" type="submit">
              Capture Referral
            </button>
          </form>
        </section>
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Founder Funnel</h2>
        <div className="grid five-step">
          <MetricCard
            label="Landing Views"
            value={metrics?.funnel.landingViews ?? 0}
          />
          <MetricCard
            label="Apply Clicks"
            value={metrics?.funnel.applyClicks ?? 0}
          />
          <MetricCard
            label="Applications"
            value={metrics?.funnel.applications ?? 0}
          />
          <MetricCard
            label="Waitlist"
            value={metrics?.funnel.waitlistCount ?? 0}
          />
          <MetricCard
            label="Referrals"
            value={metrics?.funnel.referralCount ?? 0}
          />
        </div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Founder Success Stories</h2>
        <div className="grid three">
          {(metrics?.successStories ?? []).map((story) => (
            <div className="card" key={story.title}>
              <span className="badge">{story.status}</span>
              <h3 style={{ marginTop: 10 }}>{story.title}</h3>
              <p className="muted">{story.summary}</p>
            </div>
          ))}
        </div>
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
          <Link
            className="button primary"
            href="/founders/apply"
            onClick={() =>
              void foundersApi.track({
                eventType: "APPLY_CLICK",
                source: "founders-page",
                campaign: "founder-launch",
              })
            }
          >
            Apply Now
          </Link>
        </section>
      </div>
    </main>
  );
}
