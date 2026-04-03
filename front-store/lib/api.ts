import { getEStoreApiBaseUrl, getEStoreTenantId } from "@/lib/epoc-api";

export async function getProducts(_tenant?: string) {
  const res = await fetch(`${getEStoreApiBaseUrl()}/api/products`, {
    headers: { "X-Tenant-Id": getEStoreTenantId() },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
