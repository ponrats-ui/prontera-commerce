import { civilizationMetrics } from "../lib/social-civilization";

export function CivilizationMetrics({
  merchantCount = 0,
}: {
  merchantCount?: number;
}) {
  const metrics = civilizationMetrics(merchantCount);
  return (
    <div className="civilization-metrics">
      {Object.entries(metrics).map(([label, value]) => (
        <span key={label}>
          <strong>{value.toLocaleString()}</strong>
          <small>{label.replace(/([A-Z])/g, " $1")}</small>
        </span>
      ))}
    </div>
  );
}
