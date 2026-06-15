"use client";

import { apiFetch } from "./api-client";

export type Shop = {
  id: string;
  name: string;
  slug: string;
  status?: string;
  countryCode?: string;
  preferredLocale?: string;
  preferredCurrency?: string;
  timeZone?: string;
  description?: string | null;
};

export type Product = {
  id: string;
  shopId: string;
  sku: string;
  slug: string;
  name: string;
  status: string;
  categoryId: string;
  translations?: Array<{ localeCode: string; name: string }>;
  variants?: Array<{
    id: string;
    sku: string;
    name: string;
    priceCents: number;
  }>;
  images?: Array<{ id: string; imageUrl: string; altText?: string | null }>;
};

export type Warehouse = {
  id: string;
  shopId: string;
  name: string;
  code: string;
  countryCode: string;
  timeZone: string;
  status: string;
};

export type InventoryAlert = {
  id: string;
  alertType: string;
  currentQuantity: number;
  threshold: number;
  status: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable?: number;
  status: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total: number;
  currency: string;
  createdAt?: string;
  notes?: string | null;
  items?: Array<{
    id: string;
    productName: string;
    productVariantName?: string;
    sku?: string;
    quantity: number;
    unitPrice?: number;
    totalPrice: number;
  }>;
  paymentRecords?: Array<{
    id: string;
    method: string;
    status: string;
    amount: number;
    referenceNumber?: string | null;
  }>;
};

export type POSSession = {
  id: string;
  shopId: string;
  status: string;
  openingCash: number;
  closingCash?: number | null;
  openedAt: string;
  closedAt?: string | null;
  shifts?: Array<{
    id: string;
    status: string;
    openingCash: number;
    closingCash?: number | null;
    openedAt: string;
    closedAt?: string | null;
  }>;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    roles: string[];
    preferredLocale?: string | null;
    preferredCurrency?: string | null;
    countryCode?: string | null;
    timezone?: string | null;
  };
};

export const authApi = {
  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
  register: (body: {
    name: string;
    email: string;
    password: string;
    preferredLocale: string;
    preferredCurrency: string;
    countryCode: string;
    timeZone: string;
  }) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        password: body.password,
        preferredLocale: body.preferredLocale,
        preferredCurrency: body.preferredCurrency,
        countryCode: body.countryCode,
        timezone: body.timeZone,
      }),
      token: null,
    }),
};

export const shopsApi = {
  mine: () => apiFetch<Shop[]>("/shops/me"),
  create: (body: Partial<Shop> & { name: string; slug: string }) =>
    apiFetch<Shop>("/shops", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Shop>) =>
    apiFetch<Shop>(`/shops/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const productsApi = {
  list: (shopId: string) => apiFetch<Product[]>(`/shops/${shopId}/products`),
  create: (shopId: string, body: unknown) =>
    apiFetch<Product>(`/shops/${shopId}/products`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: unknown) =>
    apiFetch<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const inventoryApi = {
  warehouses: (shopId: string) =>
    apiFetch<Warehouse[]>(`/shops/${shopId}/warehouses`),
  items: () => apiFetch<InventoryItem[]>("/inventory/items"),
  alerts: () => apiFetch<InventoryAlert[]>("/inventory/alerts"),
};

export const ordersApi = {
  list: (shopId: string) => apiFetch<Order[]>(`/shops/${shopId}/orders`),
  get: (id: string) => apiFetch<Order>(`/orders/${id}`),
};

export const posApi = {
  current: (shopId: string) =>
    apiFetch<POSSession | null>(`/pos/current?shopId=${shopId}`),
  open: (body: { shopId: string; openingCash: number }) =>
    apiFetch<POSSession>("/pos/open", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  close: (body: { sessionId: string; closingCash: number }) =>
    apiFetch<POSSession>("/pos/close", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
