"use client";

import { useEffect, useMemo, useState } from "react";
import { ordersApi, shopsApi } from "../../../lib/api";
import type { Order, Shop } from "../../../lib/api";
import {
  EmptyState,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../../components/ui";

function formatMoney(amount: number | undefined, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format((amount ?? 0) / 100);
}

export default function OrdersPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? orders[0],
    [orders, selectedId],
  );

  async function load(nextShopId = shopId) {
    if (!nextShopId) return;
    const orderData = await ordersApi.list(nextShopId);
    setOrders(orderData);
    setSelectedId(orderData[0]?.id ?? "");
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
      setError(err instanceof Error ? err.message : "Unable to load orders."),
    );
  }, []);

  const orderTotal = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <>
      <PageHeader eyebrow="Transactions" title="Orders">
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
      <div className="grid three">
        <MetricCard label="Orders" value={orders.length} />
        <MetricCard
          label="Total sales"
          value={formatMoney(orderTotal, selectedOrder?.currency)}
          hint="Loaded order records"
        />
        <MetricCard
          label="Open orders"
          value={
            orders.filter((order) =>
              ["DRAFT", "PENDING", "CONFIRMED"].includes(order.status),
            ).length
          }
        />
      </div>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel">
          <h2>Order list</h2>
          {orders.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{order.orderNumber}</td>
                      <td>
                        <span className="badge">{order.status}</span>
                      </td>
                      <td>{formatMoney(order.total, order.currency)}</td>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No orders found for this shop.</EmptyState>
          )}
        </section>
        <section className="panel">
          <h2>Order details</h2>
          {selectedOrder ? (
            <div className="stack">
              <div className="card">
                <p className="eyebrow">{selectedOrder.orderNumber}</p>
                <h3>{selectedOrder.status}</h3>
                <p className="muted">
                  Subtotal{" "}
                  {formatMoney(selectedOrder.subtotal, selectedOrder.currency)}{" "}
                  · Tax {formatMoney(selectedOrder.tax, selectedOrder.currency)}{" "}
                  · Total{" "}
                  {formatMoney(selectedOrder.total, selectedOrder.currency)}
                </p>
              </div>
              <div>
                <h3>Items</h3>
                {selectedOrder.items?.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              {item.productName}
                              <span className="muted">
                                {" "}
                                {item.productVariantName ?? item.sku}
                              </span>
                            </td>
                            <td>{item.quantity}</td>
                            <td>
                              {formatMoney(
                                item.totalPrice,
                                selectedOrder.currency,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState>No item snapshots attached.</EmptyState>
                )}
              </div>
              <div>
                <h3>Payment records</h3>
                {selectedOrder.paymentRecords?.length ? (
                  <div className="grid">
                    {selectedOrder.paymentRecords.map((payment) => (
                      <div className="card" key={payment.id}>
                        <span className="badge">{payment.status}</span>
                        <h3>{payment.method}</h3>
                        <p>
                          {formatMoney(payment.amount, selectedOrder.currency)}
                        </p>
                        {payment.referenceNumber ? (
                          <p className="muted">{payment.referenceNumber}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>No payment records yet.</EmptyState>
                )}
              </div>
            </div>
          ) : (
            <EmptyState>Select an order to inspect details.</EmptyState>
          )}
        </section>
      </div>
    </>
  );
}
