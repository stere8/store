export type AdminGap = {
  slug: string;
  title: string;
  summary: string;
  recommendedEndpoints: string[];
};

export const ADMIN_API_GAPS: AdminGap[] = [
  {
    slug: "slides",
    title: "Campaigns and home merchandising",
    summary:
      "The previous admin managed slides and campaign blocks, but EStore.Api has no merchandising model yet.",
    recommendedEndpoints: [
      "GET /api/campaigns and GET /api/campaigns/{id}",
      "POST /api/campaigns",
      "PUT /api/campaigns/{id}",
      "DELETE /api/campaigns/{id}",
      "POST /api/campaigns/{id}/publish",
    ],
  },
  {
    slug: "shippings",
    title: "Shipping rules",
    summary:
      "Admin shipping configuration is missing entirely, including regional pricing and delivery policy management.",
    recommendedEndpoints: [
      "GET /api/shipping-rules and GET /api/shipping-rules/{id}",
      "POST /api/shipping-rules",
      "PUT /api/shipping-rules/{id}",
      "DELETE /api/shipping-rules/{id}",
    ],
  },
  {
    slug: "pmethods",
    title: "Payment methods",
    summary:
      "Reservation flow is present, but admin payment-method configuration endpoints do not exist.",
    recommendedEndpoints: [
      "GET /api/payment-methods and GET /api/payment-methods/{id}",
      "POST /api/payment-methods",
      "PUT /api/payment-methods/{id}",
      "DELETE /api/payment-methods/{id}",
    ],
  },
  {
    slug: "settings",
    title: "Tenant configuration",
    summary:
      "There is no admin endpoint for tenant branding, contact details, or reservation policy configuration.",
    recommendedEndpoints: [
      "GET /api/tenant-settings",
      "PUT /api/tenant-settings",
      "PATCH /api/tenant-settings/branding",
      "PATCH /api/tenant-settings/reservations",
    ],
  },
  {
    slug: "subscriptions",
    title: "Subscriptions and billing",
    summary:
      "Legacy subscription concepts are absent from the current .NET API surface.",
    recommendedEndpoints: [
      "GET /api/subscriptions and GET /api/subscriptions/{id}",
      "POST /api/subscriptions",
      "PATCH /api/subscriptions/{id}/status",
      "GET /api/subscription-plans",
    ],
  },
  {
    slug: "withdrawals",
    title: "Vendor payouts",
    summary: "There is no payout or withdrawal model for vendor accounting.",
    recommendedEndpoints: [
      "GET /api/vendor-payouts",
      "GET /api/vendor-payouts/{id}",
      "POST /api/vendor-payouts/request",
      "PATCH /api/vendor-payouts/{id}/approve",
      "PATCH /api/vendor-payouts/{id}/pay",
    ],
  },
  {
    slug: "pages",
    title: "CMS pages",
    summary:
      "Admin-managed informational pages have no current equivalent in EStore.Api.",
    recommendedEndpoints: [
      "GET /api/cms/pages and GET /api/cms/pages/{id}",
      "POST /api/cms/pages",
      "PUT /api/cms/pages/{id}",
      "DELETE /api/cms/pages/{id}",
    ],
  },
  {
    slug: "brands",
    title: "Brands and collections",
    summary:
      "Catalog enrichment entities like brands, tags, and collections are not represented in the API.",
    recommendedEndpoints: [
      "GET /api/brands, /api/tags, /api/collections",
      "POST /api/brands, /api/tags, /api/collections",
      "PUT /api/brands/{id}, /api/tags/{id}, /api/collections/{id}",
      "DELETE /api/brands/{id}, /api/tags/{id}, /api/collections/{id}",
    ],
  },
];

export const lookupAdminGap = (segments: string[]) => {
  const slug = segments[0]?.toLowerCase();
  return ADMIN_API_GAPS.find((gap) => gap.slug === slug) ?? null;
};
