const DEFAULT_API_URL = "http://localhost:5000";
const DEFAULT_TENANT = "kigali-city-mall";

const normalizeEnvValue = (value?: string) => value?.trim();

export type VendorSession = {
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
  hasAccount: boolean;
  accountEmail?: string | null;
  accountRegisteredAt?: string | null;
  lastLoginAt?: string | null;
};

export type VendorAuthResponse = {
  accessToken: string;
  vendor: VendorSession;
};

export type VendorCategory = {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
};

export type VendorProduct = {
  id: string;
  vendorId: string;
  vendorName?: string | null;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  category?: string | null;
  price: number;
  stockQuantity: number;
  reservedQuantity: number;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
};

export type VendorReservationItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    imageUrl?: string | null;
  } | null;
};

export type VendorReservation = {
  id: string;
  reservationNumber: string;
  pickupCode: string;
  status: "Pending" | "Confirmed" | "Completed" | "Rejected" | "Cancelled";
  totalAmount: number;
  customerNotes?: string | null;
  vendorNotes?: string | null;
  createdAt: string;
  expiresAt: string;
  customer?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string | null;
  } | null;
  items?: VendorReservationItem[];
};

export const getApiBaseUrl = () =>
  normalizeEnvValue(process.env.NEXT_PUBLIC_ESTORE_API_URL) ||
  normalizeEnvValue(process.env.NEXT_PUBLIC_API_URL) ||
  DEFAULT_API_URL;

export const getDefaultTenantId = () =>
  normalizeEnvValue(process.env.NEXT_PUBLIC_ESTORE_TENANT_ID) || DEFAULT_TENANT;

const buildUrl = (path: string) => new URL(path.trim(), getApiBaseUrl()).toString();

const mergeHeaders = (
  tenantId: string,
  accessToken?: string,
  initHeaders?: HeadersInit
) => {
  const headers = new Headers(initHeaders);
  headers.set("X-Tenant-Id", tenantId);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("X-Vendor-Access-Token", accessToken);
  }

  return headers;
};

export async function apiRequest<T>(
  path: string,
  tenantId: string,
  init?: RequestInit,
  accessToken?: string
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: mergeHeaders(tenantId, accessToken, init?.headers),
    cache: "no-store",
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) {
        errorMessage = payload.error;
      }
    } catch {
      // Ignore JSON parsing errors and keep the fallback message.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
