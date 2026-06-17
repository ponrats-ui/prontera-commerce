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

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  planType: string;
  priceCents: number;
  currency: string;
  productLimit?: number | null;
  monthlyOrderLimit?: number | null;
  liveCommerce: boolean;
  advancedAnalytics: boolean;
  multiStaff: boolean;
  aiMerchantAssistant: boolean;
  crmAdvanced: boolean;
  promotionFullAccess: boolean;
};

export type MerchantSubscriptionOverview = {
  shop: Pick<Shop, "id" | "name" | "slug">;
  subscription: {
    id: string;
    status: string;
    trialStartAt?: string | null;
    trialEndAt?: string | null;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    cancelledAt?: string | null;
    plan: SubscriptionPlan;
  };
  founderProgram?: {
    id: string;
    isFounderMerchant: boolean;
    founderGrantedAt: string;
    founderExpiresAt?: string | null;
  } | null;
  isFounderMerchant: boolean;
  effectivePlan: SubscriptionPlan;
  trialDaysRemaining: number;
  trialDurationDays: number;
  starterLimits: {
    productLimit: number;
    monthlyOrderLimit: number;
    liveCommerce: boolean;
    advancedAnalytics: boolean;
    multiStaff: boolean;
    aiMerchantAssistant: boolean;
  };
  founderBenefits: {
    founderBadge: boolean;
    proAccess: boolean;
    priorityPlacement: boolean;
    earlyFeatureAccess: boolean;
  };
};

export type MerchantOnboardingDistrict = {
  slug: string;
  code: string;
  name: string;
  category: string;
  description: string;
};

export type MerchantOnboardingStatus = {
  active: boolean;
  shop?: Shop | null;
  districts: MerchantOnboardingDistrict[];
  founderProgram: {
    title: string;
    benefits: string[];
  };
};

export type MerchantOnboardingPublishInput = {
  merchantName: string;
  shopName: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  districtSlug: string;
};

export type MerchantOnboardingPublishResult = {
  message: string;
  shop: Shop;
  building: {
    id: string;
    buildingType: string;
    storefrontTheme: string;
    xCoordinate: number;
    yCoordinate: number;
    isPublished: boolean;
  };
  worldLocation: {
    id: string;
    city: WorldCity;
    district: WorldDistrict;
  };
  founderProgram: {
    id: string;
    isFounderMerchant: boolean;
  };
  links: {
    shop: string;
    world: string;
    travel: string;
  };
};

export type FounderApplication = {
  id: string;
  merchantName: string;
  businessName: string;
  businessType: string;
  category: string;
  website?: string | null;
  facebookPage?: string | null;
  email: string;
  phone: string;
  motivation: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewer?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
};

export type FounderApplicationInput = {
  merchantName: string;
  businessName: string;
  businessType: string;
  category: string;
  website?: string;
  facebookPage?: string;
  email: string;
  phone: string;
  motivation: string;
};

export type FounderMetrics = {
  goal: number;
  publicGoal: number;
  publicLabel: string;
  exampleLabel: string;
  applications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  approvedFounders: number;
  activeFounders: number;
  founderConversionRate: number;
  progressLabel: string;
  waitlistCount: number;
  referralCount: number;
  campaignEvents: number;
  landingViews: number;
  applyClicks: number;
  funnel: {
    landingViews: number;
    applyClicks: number;
    applications: number;
    waitlistCount: number;
    referralCount: number;
  };
  successStories: Array<{
    title: string;
    status: string;
    summary: string;
  }>;
};

export type FounderStatusOverview = {
  founderStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  application?: FounderApplication | null;
  applications: FounderApplication[];
  founderShop?:
    | (Shop & {
        founderMerchantProgram?: {
          id: string;
          isFounderMerchant: boolean;
          founderGrantedAt: string;
        } | null;
      })
    | null;
  benefits: Record<string, boolean>;
  progress: FounderMetrics;
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
  slug?: string;
  zone?: Pick<WorldZone, "id" | "code" | "name" | "status">;
  cityLocations?: Array<{
    id: string;
    coordinateX: number;
    coordinateY: number;
    displayOrder: number;
    city: WorldCity;
  }>;
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

export type WorldRegion = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  displayOrder: number;
  cities?: WorldCity[];
};

export type WorldCity = {
  id: string;
  regionId: string;
  name: string;
  slug: string;
  description?: string | null;
  mapImageUrl?: string | null;
  status: string;
  region?: WorldRegion;
  districtLocations?: Array<{
    id: string;
    coordinateX: number;
    coordinateY: number;
    displayOrder: number;
    district: WorldDistrict;
  }>;
  shops?: WorldShop[];
};

export type WorldShop = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  city: {
    id: string;
    name: string;
    slug: string;
    region: string;
  };
  district: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  buildingStyle: string;
  buildingType: string;
  buildingLevel: number;
  storefrontTheme: string;
  signText?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  featured: boolean;
  founderPlacement: boolean;
  liveNow: boolean;
  liveBadge?: string | null;
  isFounderMerchant: boolean;
  isOfficialStore: boolean;
  founderBadge?: string | null;
  officialStoreBadge?: string | null;
  promotionBadge?: string | null;
  promotionBanner?: string | null;
  campaignBadge?: string | null;
  subscriptionTier: string;
  featuredProducts: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    priceCents?: number | null;
    imageUrl?: string | null;
  }>;
  rankingScore: number;
};

export type DiscoveryCategory = {
  category: string;
  merchantCount: number;
  liveCount: number;
};

export type DiscoveryMetrics = {
  totalMerchants: number;
  founderMerchants: number;
  officialStores: number;
  featuredMerchants: number;
  liveMerchants: number;
  categoryCount: number;
  discoveryViews: number;
  searches: number;
  merchantClicks: number;
};

export type DiscoveryOverview = {
  merchants: WorldShop[];
  categories: DiscoveryCategory[];
  metrics: DiscoveryMetrics;
  ranking: {
    strategy: string;
    signals: Array<{ signal: string; points: number }>;
  };
};

export type MerchantBuilding = {
  id: string;
  shopId: string;
  districtId: string;
  shopName: string;
  shopSlug: string;
  description?: string | null;
  buildingType: string;
  storefrontTheme: string;
  buildingLevel: number;
  logoUrl?: string | null;
  signText?: string | null;
  bannerUrl?: string | null;
  isFounder: boolean;
  isOfficialStore: boolean;
  isLive: boolean;
  liveLabel?: string | null;
  founderBadge?: string | null;
  officialStoreBadge?: string | null;
  promotionBanner?: string | null;
  xCoordinate: number;
  yCoordinate: number;
  isPublished: boolean;
  featuredProducts: Array<{ id: string; name: string; slug: string }>;
  visualHooks: {
    founderDecoration: boolean;
    founderHighlightFrame: boolean;
    rooftopBillboard: null;
    districtSponsorship: null;
    advertisingZone: null;
    seasonalDecoration: null;
  };
};

export type MerchantBuildingMetrics = {
  publishedBuildings: number;
  founderBuildings: number;
  officialStores: number;
  liveStores: number;
  futureHooks: string[];
};

export type WorldMap = {
  regions: WorldRegion[];
  cities: WorldCity[];
  districts: WorldDistrict[];
  shops: WorldShop[];
  totals: {
    regions: number;
    cities: number;
    districts: number;
    shops: number;
    live: number;
    founders: number;
  };
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

export const subscriptionsApi = {
  plans: () => apiFetch<SubscriptionPlan[]>("/subscriptions/plans"),
  me: (shopId?: string) =>
    apiFetch<MerchantSubscriptionOverview>(
      `/subscriptions/me${shopId ? `?shopId=${shopId}` : ""}`,
    ),
  upgrade: (body: { shopId: string; planType?: string }) =>
    apiFetch<MerchantSubscriptionOverview["subscription"]>(
      "/subscriptions/upgrade",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
  cancel: (body: { shopId: string }) =>
    apiFetch<MerchantSubscriptionOverview["subscription"]>(
      "/subscriptions/cancel",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
  founder: (shopId?: string) =>
    apiFetch<
      Pick<
        MerchantSubscriptionOverview,
        "shop" | "founderProgram" | "isFounderMerchant" | "founderBenefits"
      >
    >(`/subscriptions/founder${shopId ? `?shopId=${shopId}` : ""}`),
};

export const merchantOnboardingApi = {
  start: (body: { merchantName?: string }) =>
    apiFetch<MerchantOnboardingStatus>("/merchant-onboarding/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  status: () =>
    apiFetch<MerchantOnboardingStatus>("/merchant-onboarding/status"),
  publish: (body: MerchantOnboardingPublishInput) =>
    apiFetch<MerchantOnboardingPublishResult>("/merchant-onboarding/publish", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const foundersApi = {
  metrics: () => apiFetch<FounderMetrics>("/founders/metrics", { token: null }),
  campaign: () =>
    apiFetch<FounderMetrics>("/founders/campaign", { token: null }),
  track: (body: {
    eventType:
      | "LANDING_VIEW"
      | "APPLY_CLICK"
      | "APPLICATION_SUBMITTED"
      | "WAITLIST_JOINED"
      | "REFERRAL_CAPTURED"
      | "STORY_INTEREST";
    source?: string;
    campaign?: string;
    referralCode?: string;
  }) =>
    apiFetch<{ id: string }>("/founders/campaign-events", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
  waitlist: (body: {
    merchantName: string;
    businessName: string;
    email: string;
    category: string;
    source?: string;
    referralCode?: string;
  }) =>
    apiFetch<{
      message: string;
      entry: { id: string };
      founderCounter: FounderMetrics;
    }>("/founders/waitlist", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
  refer: (body: {
    referrerEmail: string;
    referredEmail: string;
    referralCode?: string;
  }) =>
    apiFetch<{
      message: string;
      referral: { id: string; referralCode: string };
    }>("/founders/referrals", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
  apply: (body: FounderApplicationInput) =>
    apiFetch<{
      message: string;
      application: FounderApplication;
      founderCounter: FounderMetrics;
    }>("/founders/applications", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
  me: () => apiFetch<FounderStatusOverview>("/founders/me"),
  adminList: (status?: FounderApplication["status"]) =>
    apiFetch<FounderApplication[]>(
      `/admin/founders${status ? `?status=${status}` : ""}`,
    ),
  approve: (id: string, body: { shopId?: string; reviewNotes?: string }) =>
    apiFetch<{
      application: FounderApplication;
      founderProgram?: { id: string; isFounderMerchant: boolean } | null;
      message: string;
    }>(`/admin/founders/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  reject: (id: string, body: { reviewNotes?: string }) =>
    apiFetch<{ application: FounderApplication; message: string }>(
      `/admin/founders/${id}/reject`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    ),
};

export const buildingsApi = {
  list: () => apiFetch<MerchantBuilding[]>("/buildings", { token: null }),
  metrics: () =>
    apiFetch<MerchantBuildingMetrics>("/buildings/metrics", { token: null }),
  merchant: (id: string) =>
    apiFetch<MerchantBuilding>(`/merchant/${id}`, { token: null }),
  me: (shopId?: string) =>
    apiFetch<MerchantBuilding>(
      `/buildings/me${shopId ? `?shopId=${shopId}` : ""}`,
    ),
  updateMe: (body: {
    shopId: string;
    storefrontTheme?: string;
    logoUrl?: string;
    signText?: string;
    bannerUrl?: string;
  }) =>
    apiFetch<MerchantBuilding>("/buildings/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  adminList: () => apiFetch<MerchantBuilding[]>("/admin/buildings"),
  adminUpdate: (
    id: string,
    body: {
      buildingType?: string;
      storefrontTheme?: string;
      buildingLevel?: number;
      logoUrl?: string;
      signText?: string;
      bannerUrl?: string;
      isOfficialStore?: boolean;
      isPublished?: boolean;
    },
  ) =>
    apiFetch<MerchantBuilding>(`/admin/buildings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const discoveryApi = {
  overview: (query?: Record<string, string>) =>
    apiFetch<DiscoveryOverview>(`/discover${toQuery(query)}`, { token: null }),
  merchants: (query?: Record<string, string>) =>
    apiFetch<WorldShop[]>(`/discover/merchants${toQuery(query)}`, {
      token: null,
    }),
  categories: (query?: Record<string, string>) =>
    apiFetch<DiscoveryCategory[]>(`/discover/categories${toQuery(query)}`, {
      token: null,
    }),
  founders: (query?: Record<string, string>) =>
    apiFetch<WorldShop[]>(`/discover/founders${toQuery(query)}`, {
      token: null,
    }),
  official: (query?: Record<string, string>) =>
    apiFetch<WorldShop[]>(`/discover/official${toQuery(query)}`, {
      token: null,
    }),
  featured: (query?: Record<string, string>) =>
    apiFetch<WorldShop[]>(`/discover/featured${toQuery(query)}`, {
      token: null,
    }),
  metrics: () =>
    apiFetch<DiscoveryMetrics>("/discover/metrics", { token: null }),
  track: (body: {
    eventType:
      | "DISCOVERY_VIEW"
      | "MERCHANT_SEARCH"
      | "MERCHANT_CLICK"
      | "CATEGORY_FILTER"
      | "FOUNDER_FILTER"
      | "OFFICIAL_FILTER"
      | "FEATURED_FILTER";
    shopId?: string;
    searchTerm?: string;
    category?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }) =>
    apiFetch<{ id: string }>("/discover/events", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
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
  regions: () => apiFetch<WorldRegion[]>("/world/regions", { token: null }),
  cities: () => apiFetch<WorldCity[]>("/world/cities", { token: null }),
  city: (slug: string) =>
    apiFetch<WorldCity>(`/world/cities/${slug}`, { token: null }),
  zones: () => apiFetch<WorldZone[]>("/world/zones", { token: null }),
  zone: (id: string) =>
    apiFetch<WorldZone>(`/world/zones/${id}`, { token: null }),
  districts: () =>
    apiFetch<WorldDistrict[]>("/world/districts", { token: null }),
  district: (slug: string) =>
    apiFetch<WorldDistrict & { shops?: WorldShop[] }>(
      `/world/districts/${slug}`,
      { token: null },
    ),
  zoneDistricts: (id: string) =>
    apiFetch<WorldDistrict[]>(`/world/zones/${id}/districts`, {
      token: null,
    }),
  shops: (query?: Record<string, string>) =>
    apiFetch<WorldShop[]>(`/world/shops${toQuery(query)}`, { token: null }),
  shop: (slug: string) =>
    apiFetch<WorldShop>(`/world/shops/${slug}`, { token: null }),
  live: () => apiFetch<WorldShop[]>("/world/live", { token: null }),
  founders: () => apiFetch<WorldShop[]>("/world/founders", { token: null }),
  map: (query?: Record<string, string>) =>
    apiFetch<WorldMap>(`/world/map${toQuery(query)}`, { token: null }),
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

function toQuery(query?: Record<string, string>) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
