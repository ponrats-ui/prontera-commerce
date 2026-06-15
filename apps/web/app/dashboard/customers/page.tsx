"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { customersApi, shopsApi } from "../../../lib/api";
import type { Customer, Shop } from "../../../lib/api";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../../components/ui";

const initialForm = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  phone: "",
  preferredLocale: "en-US",
  preferredCurrency: "USD",
  countryCode: "US",
  timeZone: "UTC",
  source: "MANUAL",
};

export default function CustomersPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () =>
      customers.find((customer) => customer.id === selectedId) ?? customers[0],
    [customers, selectedId],
  );

  async function loadCustomers(nextShopId = shopId) {
    if (!nextShopId) return;
    const data = await customersApi.list(nextShopId);
    setCustomers(data);
    setSelectedId(data[0]?.id ?? "");
  }

  useEffect(() => {
    async function boot() {
      const myShops = await shopsApi.mine();
      setShops(myShops);
      const firstShop = myShops[0];
      if (firstShop) {
        setShopId(firstShop.id);
        await loadCustomers(firstShop.id);
      }
    }

    boot().catch((err) =>
      setError(
        err instanceof Error ? err.message : "Unable to load customers.",
      ),
    );
  }, []);

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shopId) return;
    setError(null);

    try {
      await customersApi.create(shopId, {
        ...form,
        displayName:
          form.displayName ||
          [form.firstName, form.lastName].filter(Boolean).join(" "),
      });
      setForm(initialForm);
      await loadCustomers(shopId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create customer.",
      );
    }
  }

  return (
    <>
      <PageHeader eyebrow="CRM" title="Customers">
        <select
          onChange={(event) => {
            setShopId(event.target.value);
            void loadCustomers(event.target.value);
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
      <div className="grid four">
        <MetricCard label="Customers" value={customers.length} />
        <MetricCard
          label="Active"
          value={
            customers.filter((customer) => customer.status === "ACTIVE").length
          }
        />
        <MetricCard
          label="Tagged"
          value={
            customers.filter((customer) => customer.tagAssignments?.length)
              .length
          }
        />
        <MetricCard
          label="Loyalty"
          value={customers.filter((customer) => customer.loyaltyAccount).length}
        />
      </div>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel">
          <h2>Customer list</h2>
          {customers.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedId(customer.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{customer.displayName}</td>
                      <td>{customer.email ?? "No email"}</td>
                      <td>
                        <span className="badge">{customer.status}</span>
                      </td>
                      <td>{customer.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyStateCard
              description="Create a customer profile for POS, online, manual, or imported customers."
              title="Add your first customer"
            />
          )}
        </section>
        <section className="panel">
          <h2>Create customer</h2>
          <form className="form-grid two" onSubmit={createCustomer}>
            {Object.entries(form).map(([key, value]) => (
              <label key={key}>
                {key}
                <input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  required={["firstName", "lastName"].includes(key)}
                  value={value}
                />
              </label>
            ))}
            <button className="button primary" type="submit">
              Create customer
            </button>
          </form>
        </section>
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Customer profile</h2>
        {selected ? (
          <div className="grid three">
            <div className="card">
              <p className="eyebrow">{selected.status}</p>
              <h3>{selected.displayName}</h3>
              <p className="muted">
                {selected.email ?? selected.phone ?? "No contact yet"}
              </p>
            </div>
            <div className="card">
              <h3>Tags and groups</h3>
              <p className="muted">
                {(selected.tagAssignments ?? [])
                  .map((item) => item.tag.name)
                  .join(", ") || "Tags placeholder"}
              </p>
              <p className="muted">
                {(selected.groupMemberships ?? [])
                  .map((item) => item.group.name)
                  .join(", ") || "Groups placeholder"}
              </p>
            </div>
            <div className="card">
              <h3>Loyalty summary</h3>
              <p>{selected.loyaltyAccount?.tier ?? "BRONZE"}</p>
              <p className="muted">
                {selected.loyaltyAccount?.pointsBalance ?? 0} points available
              </p>
            </div>
          </div>
        ) : (
          <EmptyStateCard
            description="Select or create a customer to view CRM details."
            title="Customer profile"
          />
        )}
      </section>
    </>
  );
}
