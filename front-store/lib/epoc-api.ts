import axios from "axios";
import { getEStoreApiBaseUrl, getEStoreTenantId } from "./estore-config";

export { getEStoreApiBaseUrl, getEStoreTenantId } from "./estore-config";

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
