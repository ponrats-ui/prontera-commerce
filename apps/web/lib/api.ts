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

export type Customer = {
  id: string;
  shopId: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  preferredLocale?: string | null;
  preferredCurrency?: string | null;
  countryCode?: string | null;
  timeZone?: string | null;
  status: string;
  source: string;
  tagAssignments?: Array<{
    id: string;
    tag: { id: string; name: string; color?: string | null };
  }>;
  groupMemberships?: Array<{ id: string; group: { id: string; name: string } }>;
  loyaltyAccount?: {
    id: string;
    pointsBalance: number;
    lifetimePoints: number;
    tier: string;
    status: string;
  } | null;
};

export type CustomerGroup = {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
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

export type PromotionCampaign = {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
  promotionType: string;
  status: string;
  startsAt?: string | null;
  endsAt?: string | null;
  priority: number;
  stackable: boolean;
  rules?: Array<{
    id: string;
    discountPercent?: number | null;
    discountAmount?: number | null;
    minimumOrderAmount?: number | null;
    minimumQuantity?: number | null;
    buyQuantity?: number | null;
    getQuantity?: number | null;
    targetCustomerGroupId?: string | null;
  }>;
};

export type Voucher = {
  id: string;
  shopId: string;
  campaignId: string;
  code: string;
  description?: string | null;
  status: string;
  usageLimit?: number | null;
  usageCount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  campaign?: PromotionCampaign;
};

export type CustomerPricingTier = {
  id: string;
  shopId: string;
  customerGroupId: string;
  name: string;
  discountPercent: number;
  status: string;
  customerGroup?: CustomerGroup;
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

export type LiveChannel = {
  id: string;
  shopId: string;
  provider: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  embedUrl: string;
  thumbnailUrl?: string | null;
  status: string;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
};

export type LiveCommerceAccess = {
  canUseLiveCommerce: boolean;
  minimumPlan: string;
};

export type WorldDistrict = {
  id: string;
  zoneId: string;
  code: string;
  name: string;
  description?: string | null;
  category: string;
  sortOrder: number;
  zone?: Pick<WorldZone, "id" | "code" | "name" | "status">;
};

export type WorldZone = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  thumbnailUrl?: string | null;
  mapImageUrl?: string | null;
  sortOrder: number;
  districts?: WorldDistrict[];
};

export type CommerceGate = {
  id: string;
  sourceZoneId: string;
  destinationZoneId: string;
  sourceDistrictId?: string | null;
  destinationDistrictId?: string | null;
  title: string;
  description?: string | null;
  gateType: string;
  status: string;
  sourceZone?: Pick<WorldZone, "id" | "code" | "name">;
  destinationZone?: Pick<WorldZone, "id" | "code" | "name">;
  sourceDistrict?: Pick<
    WorldDistrict,
    "id" | "code" | "name" | "category"
  > | null;
  destinationDistrict?: Pick<
    WorldDistrict,
    "id" | "code" | "name" | "category"
  > | null;
};

export type TravelRecommendation = {
  label: string;
  destinationType: string;
  zoneCode?: string;
  districtCode?: string;
  reason: string;
};

export type TravelOverview = {
  zones: WorldZone[];
  districts: WorldDistrict[];
  gates: CommerceGate[];
  recommendations: TravelRecommendation[];
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

export const customersApi = {
  list: (shopId: string) => apiFetch<Customer[]>(`/shops/${shopId}/customers`),
  groups: (shopId: string) =>
    apiFetch<CustomerGroup[]>(`/shops/${shopId}/customer-groups`),
  create: (shopId: string, body: unknown) =>
    apiFetch<Customer>(`/shops/${shopId}/customers`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: unknown) =>
    apiFetch<Customer>(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  loyalty: (id: string) =>
    apiFetch<Customer["loyaltyAccount"]>(`/customers/${id}/loyalty`),
};

export const promotionsApi = {
  campaigns: (shopId: string) =>
    apiFetch<PromotionCampaign[]>(`/promotions/campaigns?shopId=${shopId}`),
  createCampaign: (body: unknown) =>
    apiFetch<PromotionCampaign>("/promotions/campaigns", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  vouchers: (shopId: string) =>
    apiFetch<Voucher[]>(`/promotions/vouchers?shopId=${shopId}`),
  createVoucher: (body: unknown) =>
    apiFetch<Voucher>("/promotions/vouchers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  pricingTiers: (shopId: string) =>
    apiFetch<CustomerPricingTier[]>(
      `/promotions/pricing-tiers?shopId=${shopId}`,
    ),
  createPricingTier: (body: unknown) =>
    apiFetch<CustomerPricingTier>("/promotions/pricing-tiers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
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

export const liveCommerceApi = {
  access: (shopId: string) =>
    apiFetch<LiveCommerceAccess>(`/shops/${shopId}/live-channels/access`),
  list: (shopId: string) =>
    apiFetch<LiveChannel[]>(`/shops/${shopId}/live-channels`),
  active: (shopId: string) =>
    apiFetch<LiveChannel | null>(`/shops/${shopId}/live-channels/active`),
  create: (
    shopId: string,
    body: {
      title: string;
      description?: string;
      videoUrl: string;
      thumbnailUrl?: string;
      status?: string;
    },
  ) =>
    apiFetch<LiveChannel>(`/shops/${shopId}/live-channels`, {
      method: "POST",
      body: JSON.stringify({ provider: "YOUTUBE", ...body }),
    }),
  update: (id: string, body: Partial<LiveChannel>) =>
    apiFetch<LiveChannel>(`/live-channels/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  goLive: (id: string) =>
    apiFetch<LiveChannel>(`/live-channels/${id}/go-live`, {
      method: "POST",
    }),
  end: (id: string) =>
    apiFetch<LiveChannel>(`/live-channels/${id}/end`, {
      method: "POST",
    }),
};

export const worldApi = {
  zones: () => apiFetch<WorldZone[]>("/world/zones", { token: null }),
  zone: (id: string) =>
    apiFetch<WorldZone>(`/world/zones/${id}`, { token: null }),
  districts: () =>
    apiFetch<WorldDistrict[]>("/world/districts", { token: null }),
  zoneDistricts: (id: string) =>
    apiFetch<WorldDistrict[]>(`/world/zones/${id}/districts`, {
      token: null,
    }),
  gates: () => apiFetch<CommerceGate[]>("/world/gates", { token: null }),
  availableGates: () =>
    apiFetch<CommerceGate[]>("/world/gates/available", { token: null }),
  travel: (searchTerm?: string) => {
    const query = searchTerm
      ? `?searchTerm=${encodeURIComponent(searchTerm)}`
      : "";
    return apiFetch<TravelOverview>(`/world/travel${query}`, { token: null });
  },
};
