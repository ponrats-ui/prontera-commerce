import { notFound } from "next/navigation";
import { BuyerWorldNav } from "../../../components/buyer-world-nav";
import { RegionalDestination } from "../../../components/regional-destination";
import {
  commerceRegions,
  getCommerceRegion,
} from "../../../lib/regional-world";

export function generateStaticParams() {
  return commerceRegions.map((region) => ({ slug: region.slug }));
}

export default async function RegionalDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = getCommerceRegion(slug);
  if (!region) notFound();

  return (
    <div className="buyer-world-shell">
      <BuyerWorldNav />
      <RegionalDestination region={region} />
    </div>
  );
}
