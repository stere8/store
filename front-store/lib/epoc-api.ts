import axios from "axios";

export const getEStoreApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_ESTORE_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API ||
  "http://localhost:5000";

export const getEStoreTenantId = () =>
  process.env.NEXT_PUBLIC_ESTORE_TENANT_ID || "kigali-city-mall";

export const apiClient = axios.create({
  baseURL: getEStoreApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["X-Tenant-Id"] = getEStoreTenantId();
  return config;
});
