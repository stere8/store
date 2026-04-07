import "server-only";

export type EStoreLocation = {
  id: string;
  tenantId: string;
  name: string;
  code?: string | null;
  description?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
  floor?: string | null;
  unit?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type EStoreVendor = {
  id: string;
  tenantId: string;
  locationId?: string | null;
  displayName: string;
  legalName: string;
  contactPhone: string;
  contactEmail?: string | null;
  description?: string | null;
  active: boolean;
  verified: boolean;
  createdAt: string;
};

export type EStoreCategory = {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
};

export type EStoreProduct = {
  id: string;
  tenantId: string;
  vendorId: string;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  reservedQuantity: number;
  imageUrl?: string | null;
  categoryId?: string | null;
  active: boolean;
  createdAt: string;
};

export type EStoreCustomer = {
  id: string;
  tenantId: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  preferredLanguage?: string | null;
  isArchived?: boolean;
  archivedAt?: string | null;
  archivedReason?: string | null;
};

export type CustomerReconciliationIssueType =
  | "clerk-only"
  | "db-only"
  | "mismatched";

export type EStoreCustomerIdentityIgnore = {
  id: string;
  tenantId: string;
  issueType: CustomerReconciliationIssueType;
  subjectKey: string;
  fingerprint: string;
  createdAt: string;
};

export type EStoreReview = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  createdAt: string;
  customerId: string;
};

export type EStoreReservationItem = {
  id: string;
  tenantId?: string;
  reservationId?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: EStoreProduct | null;
};

export type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Rejected"
  | "Cancelled";

export type EStoreReservation = {
  id: string;
  tenantId: string;
  customerId: string;
  vendorId: string;
  reservationNumber: string;
  pickupCode: string;
  status: ReservationStatus;
  totalAmount: number;
  customerNotes?: string | null;
  vendorNotes?: string | null;
  createdAt: string;
  expiresAt: string;
  confirmedAt?: string | null;
  completedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  stockFinalized?: boolean;
  customer?: EStoreCustomer | null;
  vendor?: EStoreVendor | null;
  items?: EStoreReservationItem[];
};

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined | null>;
};

export class EStoreApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "EStoreApiError";
    this.status = status;
    this.details = details;
  }
}

const normalizeEnvValue = (value?: string) => value?.trim();

export const getEStoreApiBaseUrl = () =>
  normalizeEnvValue(process.env.NEXT_PUBLIC_ESTORE_API_URL) ||
  normalizeEnvValue(process.env.NEXT_PUBLIC_API_URL) ||
  normalizeEnvValue(process.env.NEXT_PUBLIC_API) ||
  "http://localhost:5000";

export const getEStoreTenantId = () =>
  normalizeEnvValue(process.env.NEXT_PUBLIC_ESTORE_TENANT_ID) || "kigali-city-mall";

const buildUrl = (
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
) => {
  const url = new URL(path, getEStoreApiBaseUrl());
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const getMessageFromDetails = (details: unknown, fallback: string) => {
  if (details && typeof details === "object" && "error" in details) {
    const message = (details as { error?: unknown }).error;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
};

async function estoreRequest<T>(path: string, options: RequestOptions = {}) {
  const { query, headers, body, ...init } = options;
  const response = await fetch(buildUrl(path, query), {
    ...init,
    cache: "no-store",
    headers: {
      "X-Tenant-Id": getEStoreTenantId(),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body,
  });

  if (!response.ok) {
    let details: unknown;

    try {
      details = await response.json();
    } catch {
      details = undefined;
    }

    throw new EStoreApiError(
      getMessageFromDetails(details, response.statusText || "EStore.Api request failed."),
      response.status,
      details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listLocations() {
  return estoreRequest<EStoreLocation[]>("/api/locations");
}

export async function createLocation(payload: {
  name: string;
  code?: string;
  description?: string;
}) {
  return estoreRequest<EStoreLocation>("/api/locations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listVendors() {
  return estoreRequest<EStoreVendor[]>("/api/vendors");
}

export async function getVendor(id: string) {
  const vendors = await listVendors();
  return vendors.find((vendor) => vendor.id === id) ?? null;
}

export async function createVendor(payload: {
  displayName: string;
  legalName: string;
  contactPhone: string;
  contactEmail?: string;
  description?: string;
  locationId?: string;
}) {
  return estoreRequest<EStoreVendor>("/api/vendors/register", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      locationId: payload.locationId || null,
    }),
  });
}

export async function approveVendor(id: string) {
  return estoreRequest<EStoreVendor>(`/api/vendors/${id}/approve`, {
    method: "PATCH",
    query: {
      verified: true,
    },
  });
}

export async function listCategories() {
  return estoreRequest<EStoreCategory[]>("/api/categories");
}

export async function getCategory(id: string) {
  const categories = await listCategories();
  return categories.find((category) => category.id === id) ?? null;
}

export async function createCategory(payload: {
  name: string;
  description?: string;
}) {
  return estoreRequest<EStoreCategory>("/api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  id: string,
  payload: {
    name: string;
    description?: string;
  }
) {
  return estoreRequest<EStoreCategory>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: string) {
  return estoreRequest<void>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}

export async function listProducts() {
  return estoreRequest<EStoreProduct[]>("/api/products");
}

export async function getProduct(id: string) {
  const products = await listProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function createProduct(payload: {
  vendorId: string;
  name: string;
  description?: string;
  categoryId?: string;
  price: number;
  stock: number;
  imageUrl?: string;
}) {
  return estoreRequest<EStoreProduct>("/api/products", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      categoryId: payload.categoryId || null,
      imageUrl: payload.imageUrl || null,
    }),
  });
}

export async function updateProduct(
  id: string,
  payload: {
    vendorId: string;
    name: string;
    description?: string;
    categoryId?: string;
    price: number;
    stock: number;
    imageUrl?: string;
  }
) {
  return estoreRequest<EStoreProduct>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      categoryId: payload.categoryId || null,
      imageUrl: payload.imageUrl || null,
    }),
  });
}

export async function deleteProduct(id: string) {
  return estoreRequest<void>(`/api/products/${id}`, {
    method: "DELETE",
  });
}

export async function upsertCustomer(payload: {
  username: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  preferredLanguage?: string | null;
}) {
  return estoreRequest<EStoreCustomer>("/api/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listCustomers(
  search?: string,
  options?: { includeArchived?: boolean }
) {
  if (search && search.trim().length > 0) {
    return estoreRequest<EStoreCustomer[]>("/api/customers/search", {
      query: {
        q: search.trim(),
        includeArchived: options?.includeArchived ? true : undefined,
      },
    });
  }

  return estoreRequest<EStoreCustomer[]>("/api/customers", {
    query: {
      includeArchived: options?.includeArchived ? true : undefined,
    },
  });
}

export async function archiveCustomer(id: string, reason?: string) {
  return estoreRequest<EStoreCustomer>(`/api/customers/${id}/archive`, {
    method: "PATCH",
    body: JSON.stringify({
      reason: reason || "Archived from admin reconciliation.",
    }),
  });
}

export async function listCustomerIdentityIgnores() {
  return estoreRequest<EStoreCustomerIdentityIgnore[]>(
    "/api/customers/reconciliation/ignores"
  );
}

export async function upsertCustomerIdentityIgnore(payload: {
  issueType: CustomerReconciliationIssueType;
  subjectKey: string;
  fingerprint: string;
}) {
  return estoreRequest<EStoreCustomerIdentityIgnore>(
    "/api/customers/reconciliation/ignores",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteCustomerIdentityIgnore(
  issueType: CustomerReconciliationIssueType,
  subjectKey: string
) {
  return estoreRequest<void>(
    `/api/customers/reconciliation/ignores/${issueType}/${encodeURIComponent(subjectKey)}`,
    {
      method: "DELETE",
    }
  );
}

export async function listReservations() {
  return estoreRequest<EStoreReservation[]>("/api/reservations");
}

export async function listVendorReservations(vendorId: string) {
  return estoreRequest<EStoreReservation[]>(`/api/vendors/${vendorId}/reservations`);
}

export async function getReservation(id: string) {
  try {
    return await estoreRequest<EStoreReservation>(`/api/reservations/${id}`);
  } catch (error) {
    if (error instanceof EStoreApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function changeReservationStatus(
  id: string,
  action: "confirm" | "complete" | "reject" | "cancel"
) {
  const statusByAction = {
    confirm: "Confirmed",
    complete: "Completed",
    reject: "Rejected",
    cancel: "Cancelled",
  } as const;

  return estoreRequest<EStoreReservation>(`/api/reservations/${id}/status`, {
    method: "PATCH",
    query: {
      status: statusByAction[action],
    },
  });
}

export async function updateReservationNote(id: string, note: string) {
  return estoreRequest<EStoreReservation>(`/api/reservations/${id}/note`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}

export async function listProductReviews(productId: string) {
  const response = await estoreRequest<{
    items?: EStoreReview[];
  }>(`/api/products/${productId}/reviews`);

  return response.items ?? [];
}
