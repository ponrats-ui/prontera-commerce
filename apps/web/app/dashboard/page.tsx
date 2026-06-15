"use client";

import { useEffect, useState } from "react";
import { inventoryApi, ordersApi, productsApi, shopsApi } from "../../lib/api";
import type { InventoryAlert, Order, Product, Shop } from "../../lib/api";
import {
  EmptyState,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../components/ui";

export default function DashboardPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const myShops = await shopsApi.mine();
        setShops(myShops);
        const firstShop = myShops[0];
        if (!firstShop) return;

        const [shopProducts, shopOrders, inventoryAlerts] = await Promise.all([
          productsApi.list(firstShop.id).catch(() => []),
          ordersApi.list(firstShop.id).catch(() => []),
          inventoryApi.alerts().catch(() => []),
        ]);

        setProducts(shopProducts);
        setOrders(shopOrders);
        setAlerts(inventoryAlerts);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard.",
        );
      }
    }

    void load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const ordersToday = orders.filter((order) =>
    order.createdAt?.startsWith(today),
  ).length;

  return (
    <>
      <PageHeader eyebrow="Overview" title="Merchant Dashboard" />
      <ErrorMessage message={error} />
      <div className="grid four">
        <MetricCard label="Shops" value={shops.length} />
        <MetricCard label="Products" value={products.length} />
        <MetricCard label="Inventory alerts" value={alerts.length} />
        <MetricCard label="Orders today" value={ordersToday} />
      </div>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel">
          <h2>Total sales summary</h2>
          <p className="metric-value">
            {orders
              .reduce((sum, order) => sum + order.total, 0)
              .toLocaleString()}
          </p>
          <p className="muted">Manual payment records only in Sprint 6.</p>
        </section>
        <section className="panel">
          <h2>Operational focus</h2>
          {alerts.length ? (
            <div className="grid">
              {alerts.slice(0, 4).map((alert) => (
                <div className="card" key={alert.id}>
                  <span className="badge warn">{alert.alertType}</span>
                  <p style={{ marginTop: 8 }}>
                    Current {alert.currentQuantity}, threshold {alert.threshold}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No open inventory alerts.</EmptyState>
          )}
        </section>
      </div>
    </>
  );
}
