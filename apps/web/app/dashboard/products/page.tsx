"use client";

import { FormEvent, useEffect, useState } from "react";
import { productsApi, shopsApi } from "../../../lib/api";
import type { Product, Shop } from "../../../lib/api";
import {
  EmptyState,
  EmptyStateCard,
  ErrorMessage,
  PageHeader,
} from "../../../components/ui";

export default function ProductsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    sku: "",
    slug: "",
    categoryId: "",
    name: "",
    description: "",
  });

  async function loadProducts(nextShopId = shopId) {
    if (!nextShopId) return;
    setProducts(await productsApi.list(nextShopId));
  }

  useEffect(() => {
    async function load() {
      const myShops = await shopsApi.mine();
      setShops(myShops);
      const firstShop = myShops[0];
      if (firstShop) {
        setShopId(firstShop.id);
        setProducts(await productsApi.list(firstShop.id));
      }
    }

    load().catch((err) =>
      setError(err instanceof Error ? err.message : "Unable to load products."),
    );
  }, []);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shopId) return;
    setError(null);

    try {
      await productsApi.create(shopId, {
        sku: form.sku,
        slug: form.slug,
        categoryId: form.categoryId,
        translations: [
          {
            locale: "en-US",
            name: form.name,
            description: form.description,
          },
        ],
      });
      setForm({ sku: "", slug: "", categoryId: "", name: "", description: "" });
      await loadProducts(shopId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create product.",
      );
    }
  }

  async function saveSelected() {
    if (!selected) return;
    setError(null);
    try {
      const updated = await productsApi.update(selected.id, {
        sku: selected.sku,
        slug: selected.slug,
        status: selected.status,
      });
      setSelected(updated);
      await loadProducts(shopId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update product.",
      );
    }
  }

  return (
    <>
      <PageHeader eyebrow="Catalog" title="Product Management">
        <select
          onChange={(event) => {
            setShopId(event.target.value);
            void loadProducts(event.target.value);
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
          <h2>Products</h2>
          {products.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>
                        <span className="badge">{product.status}</span>
                      </td>
                      <td>
                        <button
                          className="button"
                          onClick={() => setSelected(product)}
                          type="button"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyStateCard
              description="Create a product after selecting a shop. Use the demo seed to preload a category and sample product."
              title="Add your first product"
            />
          )}
        </section>

        <section className="panel">
          <h2>Create product</h2>
          <form className="form-grid" onSubmit={createProduct}>
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
                  required={key !== "description"}
                  value={value}
                />
              </label>
            ))}
            <button className="button primary" type="submit">
              Create product
            </button>
          </form>
        </section>
      </div>

      {selected ? (
        <section className="panel" style={{ marginTop: 16 }}>
          <h2>Product details</h2>
          <div className="form-grid two">
            <label>
              SKU
              <input
                onChange={(event) =>
                  setSelected({ ...selected, sku: event.target.value })
                }
                value={selected.sku}
              />
            </label>
            <label>
              Slug
              <input
                onChange={(event) =>
                  setSelected({ ...selected, slug: event.target.value })
                }
                value={selected.slug}
              />
            </label>
            <label>
              Status
              <select
                onChange={(event) =>
                  setSelected({ ...selected, status: event.target.value })
                }
                value={selected.status}
              >
                <option>DRAFT</option>
                <option>ACTIVE</option>
                <option>ARCHIVED</option>
              </select>
            </label>
            <div className="button-row">
              <button
                className="button primary"
                onClick={saveSelected}
                type="button"
              >
                Save product
              </button>
            </div>
          </div>
          <div className="grid three" style={{ marginTop: 16 }}>
            <div className="card">
              <h3>Translations</h3>
              {(selected.translations ?? []).map((translation) => (
                <p key={translation.localeCode}>
                  {translation.localeCode}: {translation.name}
                </p>
              ))}
            </div>
            <div className="card">
              <h3>Variants</h3>
              {(selected.variants ?? []).map((variant) => (
                <p key={variant.id}>
                  {variant.sku}: {variant.name}
                </p>
              ))}
            </div>
            <div className="card">
              <h3>Images</h3>
              {(selected.images ?? []).map((image) => (
                <p key={image.id}>{image.altText ?? image.imageUrl}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
