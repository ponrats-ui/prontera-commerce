"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  customersApi,
  promotionsApi,
  shopsApi,
  type CustomerGroup,
  type CustomerPricingTier,
  type PromotionCampaign,
  type Shop,
  type Voucher,
} from "../../../lib/api";
import {
  EmptyStateCard,
  ErrorMessage,
  MetricCard,
  PageHeader,
} from "../../../components/ui";

const tabs = ["Campaigns", "Vouchers", "Pricing Tiers"] as const;

const campaignFormInitial = {
  name: "",
  promotionType: "PERCENT_DISCOUNT",
  status: "ACTIVE",
  discountPercent: 10,
  discountAmount: 500,
  minimumOrderAmount: 0,
  priority: 0,
};

const voucherFormInitial = {
  code: "",
  campaignId: "",
  status: "ACTIVE",
  usageLimit: 100,
};

const tierFormInitial = {
  name: "VIP Pricing",
  customerGroupId: "",
  discountPercent: 15,
  status: "ACTIVE",
};

export default function PromotionsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState("");
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [tiers, setTiers] = useState<CustomerPricingTier[]>([]);
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("Campaigns");
  const [campaignForm, setCampaignForm] = useState(campaignFormInitial);
  const [voucherForm, setVoucherForm] = useState(voucherFormInitial);
  const [tierForm, setTierForm] = useState(tierFormInitial);
  const [error, setError] = useState<string | null>(null);

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "ACTIVE"),
    [campaigns],
  );

  async function loadPromotions(nextShopId = shopId) {
    if (!nextShopId) return;
    const [nextCampaigns, nextVouchers, nextTiers, nextGroups] =
      await Promise.all([
        promotionsApi.campaigns(nextShopId),
        promotionsApi.vouchers(nextShopId),
        promotionsApi.pricingTiers(nextShopId),
        customersApi.groups(nextShopId),
      ]);

    setCampaigns(nextCampaigns);
    setVouchers(nextVouchers);
    setTiers(nextTiers);
    setGroups(nextGroups);
    setVoucherForm((current) => ({
      ...current,
      campaignId: current.campaignId || nextCampaigns[0]?.id || "",
    }));
    setTierForm((current) => ({
      ...current,
      customerGroupId: current.customerGroupId || nextGroups[0]?.id || "",
    }));
  }

  useEffect(() => {
    async function boot() {
      const myShops = await shopsApi.mine();
      setShops(myShops);
      const firstShop = myShops[0];
      if (firstShop) {
        setShopId(firstShop.id);
        await loadPromotions(firstShop.id);
      }
    }

    boot().catch((err) =>
      setError(
        err instanceof Error ? err.message : "Unable to load promotions.",
      ),
    );
  }, []);

  async function createCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shopId) return;
    setError(null);

    try {
      const rules =
        campaignForm.promotionType === "FIXED_DISCOUNT"
          ? [{ discountAmount: Number(campaignForm.discountAmount) }]
          : [
              {
                discountPercent: Number(campaignForm.discountPercent),
                minimumOrderAmount: Number(campaignForm.minimumOrderAmount),
              },
            ];

      await promotionsApi.createCampaign({
        shopId,
        name: campaignForm.name,
        promotionType: campaignForm.promotionType,
        status: campaignForm.status,
        priority: Number(campaignForm.priority),
        rules,
      });
      setCampaignForm(campaignFormInitial);
      await loadPromotions(shopId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create campaign.",
      );
    }
  }

  async function createVoucher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shopId || !voucherForm.campaignId) return;
    setError(null);

    try {
      await promotionsApi.createVoucher({
        shopId,
        campaignId: voucherForm.campaignId,
        code: voucherForm.code,
        status: voucherForm.status,
        usageLimit: Number(voucherForm.usageLimit),
      });
      setVoucherForm({
        ...voucherFormInitial,
        campaignId: campaigns[0]?.id ?? "",
      });
      await loadPromotions(shopId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create voucher.",
      );
    }
  }

  async function createPricingTier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shopId || !tierForm.customerGroupId) return;
    setError(null);

    try {
      await promotionsApi.createPricingTier({
        shopId,
        customerGroupId: tierForm.customerGroupId,
        name: tierForm.name,
        discountPercent: Number(tierForm.discountPercent),
        status: tierForm.status,
      });
      setTierForm({
        ...tierFormInitial,
        customerGroupId: groups[0]?.id ?? "",
      });
      await loadPromotions(shopId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create pricing tier.",
      );
    }
  }

  return (
    <>
      <PageHeader eyebrow="Merchant OS" title="Promotions">
        <select
          onChange={(event) => {
            setShopId(event.target.value);
            void loadPromotions(event.target.value);
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
        <MetricCard label="Campaigns" value={campaigns.length} />
        <MetricCard label="Active" value={activeCampaigns.length} />
        <MetricCard label="Vouchers" value={vouchers.length} />
        <MetricCard label="Pricing tiers" value={tiers.length} />
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              className={`button ${activeTab === tab ? "primary" : ""}`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </section>
      {activeTab === "Campaigns" ? (
        <div className="grid two" style={{ marginTop: 16 }}>
          <section className="panel">
            <h2>Campaign list</h2>
            {campaigns.length ? (
              <PromotionTable campaigns={campaigns} />
            ) : (
              <EmptyStateCard
                description="Create the first automatic discount campaign for this shop."
                title="No campaigns yet"
              />
            )}
          </section>
          <section className="panel">
            <h2>Create campaign</h2>
            <form className="form-grid two" onSubmit={createCampaign}>
              <label>
                name
                <input
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                  value={campaignForm.name}
                />
              </label>
              <label>
                promotionType
                <select
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      promotionType: event.target.value,
                    }))
                  }
                  value={campaignForm.promotionType}
                >
                  <option value="PERCENT_DISCOUNT">PERCENT_DISCOUNT</option>
                  <option value="FIXED_DISCOUNT">FIXED_DISCOUNT</option>
                  <option value="BUY_X_GET_Y">BUY_X_GET_Y</option>
                  <option value="FREE_SHIPPING_PLACEHOLDER">
                    FREE_SHIPPING_PLACEHOLDER
                  </option>
                  <option value="CUSTOMER_GROUP_DISCOUNT">
                    CUSTOMER_GROUP_DISCOUNT
                  </option>
                </select>
              </label>
              <label>
                status
                <select
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  value={campaignForm.status}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </label>
              <label>
                discountPercent
                <input
                  min={1}
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      discountPercent: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={campaignForm.discountPercent}
                />
              </label>
              <label>
                discountAmount
                <input
                  min={0}
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      discountAmount: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={campaignForm.discountAmount}
                />
              </label>
              <label>
                minimumOrderAmount
                <input
                  min={0}
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      minimumOrderAmount: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={campaignForm.minimumOrderAmount}
                />
              </label>
              <label>
                priority
                <input
                  min={0}
                  onChange={(event) =>
                    setCampaignForm((current) => ({
                      ...current,
                      priority: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={campaignForm.priority}
                />
              </label>
              <button className="button primary" type="submit">
                Create campaign
              </button>
            </form>
          </section>
        </div>
      ) : null}
      {activeTab === "Vouchers" ? (
        <div className="grid two" style={{ marginTop: 16 }}>
          <section className="panel">
            <h2>Voucher list</h2>
            {vouchers.length ? (
              <VoucherTable vouchers={vouchers} />
            ) : (
              <EmptyStateCard
                description="Attach a voucher code to an active campaign."
                title="No vouchers yet"
              />
            )}
          </section>
          <section className="panel">
            <h2>Create voucher</h2>
            <form className="form-grid two" onSubmit={createVoucher}>
              <label>
                code
                <input
                  onChange={(event) =>
                    setVoucherForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  required
                  value={voucherForm.code}
                />
              </label>
              <label>
                campaign
                <select
                  onChange={(event) =>
                    setVoucherForm((current) => ({
                      ...current,
                      campaignId: event.target.value,
                    }))
                  }
                  required
                  value={voucherForm.campaignId}
                >
                  <option value="">Select campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                status
                <select
                  onChange={(event) =>
                    setVoucherForm((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  value={voucherForm.status}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </label>
              <label>
                usageLimit
                <input
                  min={1}
                  onChange={(event) =>
                    setVoucherForm((current) => ({
                      ...current,
                      usageLimit: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={voucherForm.usageLimit}
                />
              </label>
              <button className="button primary" type="submit">
                Create voucher
              </button>
            </form>
          </section>
        </div>
      ) : null}
      {activeTab === "Pricing Tiers" ? (
        <div className="grid two" style={{ marginTop: 16 }}>
          <section className="panel">
            <h2>Pricing tier list</h2>
            {tiers.length ? (
              <TierTable tiers={tiers} />
            ) : (
              <EmptyStateCard
                description="Create customer-group pricing for VIP, wholesale, employee, or partner groups."
                title="No pricing tiers yet"
              />
            )}
          </section>
          <section className="panel">
            <h2>Create VIP pricing</h2>
            <form className="form-grid two" onSubmit={createPricingTier}>
              <label>
                name
                <input
                  onChange={(event) =>
                    setTierForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                  value={tierForm.name}
                />
              </label>
              <label>
                customerGroup
                <select
                  onChange={(event) =>
                    setTierForm((current) => ({
                      ...current,
                      customerGroupId: event.target.value,
                    }))
                  }
                  required
                  value={tierForm.customerGroupId}
                >
                  <option value="">Select group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                discountPercent
                <input
                  max={100}
                  min={1}
                  onChange={(event) =>
                    setTierForm((current) => ({
                      ...current,
                      discountPercent: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={tierForm.discountPercent}
                />
              </label>
              <label>
                status
                <select
                  onChange={(event) =>
                    setTierForm((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  value={tierForm.status}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </label>
              <button className="button primary" type="submit">
                Create VIP pricing
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function PromotionTable({ campaigns }: { campaigns: PromotionCampaign[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>{campaign.name}</td>
              <td>{campaign.promotionType}</td>
              <td>
                <span className="badge">{campaign.status}</span>
              </td>
              <td>{campaign.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VoucherTable({ vouchers }: { vouchers: Voucher[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Status</th>
            <th>Usage</th>
            <th>Campaign</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((voucher) => (
            <tr key={voucher.id}>
              <td>{voucher.code}</td>
              <td>
                <span className="badge">{voucher.status}</span>
              </td>
              <td>
                {voucher.usageCount}/{voucher.usageLimit ?? "open"}
              </td>
              <td>{voucher.campaign?.name ?? voucher.campaignId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TierTable({ tiers }: { tiers: CustomerPricingTier[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Group</th>
            <th>Discount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => (
            <tr key={tier.id}>
              <td>{tier.name}</td>
              <td>{tier.customerGroup?.name ?? tier.customerGroupId}</td>
              <td>{tier.discountPercent}%</td>
              <td>
                <span className="badge">{tier.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
