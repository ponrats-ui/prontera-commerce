"use client";

import { useEffect, useState } from "react";
import { inventoryApi, shopsApi } from "../../../lib/api";
import type {
  InventoryAlert,
  InventoryItem,
  Shop,
  Warehouse,
} from "../../../lib/api";
import {
  EmptyState,
  EmptyStateCard,
  ErrorMessage,
  PageHeader,
} from "../../../components/ui";

export default function InventoryPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [itemsNote, setItemsNote] = useState<string | null>(null);

  async function load(nextShopId = shopId) {
    if (!nextShopId) return;
    const [warehouseData, alertData] = await Promise.all([
      inventoryApi.warehouses(nextShopId),
      inventoryApi.alerts().catch(() => []),
    ]);
    setWarehouses(warehouseData);
    setAlerts(alertData);

    try {
      setItems(await inventoryApi.items());
      setItemsNote(null);
    } catch {
      setItems([]);
      setItemsNote("Inventory item listing endpoint is not available yet.");
    }
  }

  useEffect(() => {
    async function boot() {
      const myShops = await shopsApi.mine();
      setShops(myShops);
      const firstShop = myShops[0];
      if (firstShop) {
        setShopId(firstShop.id);
        await load(firstShop.id);
      }
    }

    boot().catch((err) =>
      setError(
        err instanceof Error ? err.message : "Unable to load inventory.",
      ),
    );
  }, []);

  return (
    <>
      <PageHeader eyebrow="Operations" title="Inventory Management">
        <select
          onChange={(event) => {
            setShopId(event.target.value);
            void load(event.target.value);
          }}
          value={shopId}
        >
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>
      </PageHeader>
      <ErrorMessage message={error} />
      <div className="grid two">
        <section className="panel">
          <h2>Warehouses</h2>
          {warehouses.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Country</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse.id}>
                      <td>{warehouse.name}</td>
                      <td>{warehouse.code}</td>
                      <td>{warehouse.countryCode}</td>
                      <td>
                        <span className="badge">{warehouse.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyStateCard
              description="Create a warehouse through the API or run the demo seed to preload one for local testing."
              title="Add inventory"
            />
          )}
        </section>
        <section className="panel">
          <h2>Low stock alerts</h2>
          {alerts.length ? (
            <div className="grid">
              {alerts.map((alert) => (
                <div className="card" key={alert.id}>
                  <span className="badge warn">{alert.alertType}</span>
                  <p style={{ marginTop: 8 }}>
                    Current {alert.currentQuantity}, threshold {alert.threshold}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No low stock alerts.</EmptyState>
          )}
        </section>
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Inventory items</h2>
        {itemsNote ? <p className="muted">{itemsNote}</p> : null}
        {items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>On hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.quantityOnHand}</td>
                    <td>{item.quantityReserved}</td>
                    <td>
                      {item.quantityAvailable ??
                        item.quantityOnHand - item.quantityReserved}
                    </td>
                    <td>
                      <span className="badge">{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStateCard
            description="Run the demo seed or add stock records through the inventory API to populate this table."
            title="Add inventory"
          />
        )}
      </section>
    </>
  );
}
