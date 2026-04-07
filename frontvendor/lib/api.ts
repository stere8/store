const DEFAULT_API_URL = "http://localhost:5000";
const DEFAULT_TENANT = "kigali-city-mall";

const normalizeEnvValue = (value?: string) => value?.trim();

export const getApiBaseUrl = () =>
  normalizeEnvValue(process.env.NEXT_PUBLIC_ESTORE_API_URL) ||
  normalizeEnvValue(process.env.NEXT_PUBLIC_API_URL) ||
  DEFAULT_API_URL;

export const getDefaultTenantId = () =>
  normalizeEnvValue(process.env.NEXT_PUBLIC_ESTORE_TENANT_ID) || DEFAULT_TENANT;

const buildUrl = (path: string) => new URL(path.trim(), getApiBaseUrl()).toString();

export async function apiRequest<T>(
  path: string,
  tenantId: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      ...(init?.headers || {}),
    },
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
