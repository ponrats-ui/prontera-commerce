import Link from "next/link";

export default function TownPage() {
  return (
    <main className="town-content">
      <section className="town-welcome">
        <div>
          <p className="world-kicker">Buyer World Entry</p>
          <h1>Welcome to the Prontera World</h1>
          <p>
            This is not a normal marketplace. Merchants have places, districts
            have identities, and discovery begins by entering the city.
          </p>
          <div className="button-row">
            <Link className="world-button primary" href="/town/merchant-city">
              Enter Merchant City
            </Link>
            <Link className="world-button" href="/world/travel">
              Open Warp Gate
            </Link>
          </div>
        </div>
        <div className="town-compass">
          <span>N</span>
          <strong>Merchant City</strong>
          <small>First commerce destination</small>
        </div>
      </section>
    </main>
  );
}
