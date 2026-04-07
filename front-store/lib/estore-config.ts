const normalizeEnvValue = (value?: string) => value?.trim();

export const getEStoreApiBaseUrl = () =>
  normalizeEnvValue(process.env.NEXT_PUBLIC_ESTORE_API_URL) ||
  normalizeEnvValue(process.env.NEXT_PUBLIC_API_URL) ||
  normalizeEnvValue(process.env.NEXT_PUBLIC_API) ||
  "http://localhost:5000";

export const getEStoreTenantId = () =>
  normalizeEnvValue(process.env.NEXT_PUBLIC_ESTORE_TENANT_ID) ||
  "kigali-city-mall";

