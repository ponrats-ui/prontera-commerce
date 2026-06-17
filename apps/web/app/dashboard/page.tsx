"use client";

import { useEffect, useState } from "react";
import {
  customersApi,
  foundersApi,
  inventoryApi,
  ordersApi,
  productsApi,
  shopsApi,
} from "../../lib/api";
import type {
  Customer,
  FounderStatusOverview,
  InventoryAlert,
  Order,
  Product,
  Shop,
} from "../../lib/api";
import {
  EmptyState,
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../components/ui";

export default function DashboardPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [founderStatus, setFounderStatus] =
    useState<FounderStatusOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const myShops = await shopsApi.mine();
        setShops(myShops);
        const firstShop = myShops[0];
        if (!firstShop) return;

        const [shopProducts, shopCustomers, shopOrders, inventoryAlerts] =
          await Promise.all([
            productsApi.list(firstShop.id).catch(() => []),
            customersApi.list(firstShop.id).catch(() => []),
            ordersApi.list(firstShop.id).catch(() => []),
            inventoryApi.alerts().catch(() => []),
          ]);

        setProducts(shopProducts);
        setCustomers(shopCustomers);
        setOrders(shopOrders);
        setAlerts(inventoryAlerts);
        setFounderStatus(await foundersApi.me().catch(() => null));
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
        <MetricCard label="Customers" value={customers.length} />
        <MetricCard label="Products" value={products.length} />
        <MetricCard label="Inventory alerts" value={alerts.length} />
        <MetricCard label="Orders today" value={ordersToday} />
      </div>
      <div className="grid two" style={{ marginTop: 16 }}>
        {!shops.length ? (
          <EmptyStateCard
            action="Create shop"
            description="Start by creating a merchant shop with country, locale, currency, and timezone preferences."
            href="/dashboard/shops"
            title="Create your first shop"
          />
        ) : null}
        {shops.length && !products.length ? (
          <EmptyStateCard
            action="Add product"
            description="Create the first catalog item once your shop and category data are ready."
            href="/dashboard/products"
            title="Add your first product"
          />
        ) : null}
        {shops.length && !customers.length ? (
          <EmptyStateCard
            action="Add customer"
            description="Create the first CRM profile for POS, online, or manual customers."
            href="/dashboard/customers"
            title="Add your first customer"
          />
        ) : null}
        {shops.length && !alerts.length ? (
          <EmptyStateCard
            action="Review inventory"
            description="Add warehouses and stock records so the dashboard can surface low stock alerts."
            href="/dashboard/inventory"
            title="Add inventory"
          />
        ) : null}
        {shops.length ? (
          <EmptyStateCard
            action="Open POS"
            description="Open a counter sales session and test the POS session lifecycle locally."
            href="/dashboard/pos"
            title="Open POS"
          />
        ) : null}
        <section className="panel">
          <h2>Founder Merchant status</h2>
          <div className="card">
            <p className="eyebrow">
              {founderStatus?.founderStatus ?? "NOT APPLIED"}
            </p>
            <h3>
              {founderStatus?.founderShop
                ? "Founder Merchant active"
                : founderStatus?.application
                  ? "Application under review"
                  : "Apply for Founder Merchant"}
            </h3>
            <p className="muted">
              Founder merchants receive a badge, 1 month Pro free, Founder
              District placement, early access, recognition, and priority
              discovery.
            </p>
            <p>
              {founderStatus?.progress.publicLabel ??
                "Founder Merchant 100 Program"}
            </p>
            <a className="button" href="/founders">
              View Founder Program
            </a>
          </div>
        </section>
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
