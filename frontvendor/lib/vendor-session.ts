import "server-only";

import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "frontvendor_access_token";
const TENANT_COOKIE = "frontvendor_tenant_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
});

export const readVendorAccessToken = () =>
  cookies().get(ACCESS_TOKEN_COOKIE)?.value || "";

export const readVendorTenantId = () => cookies().get(TENANT_COOKIE)?.value || "";

export const writeVendorSession = (accessToken: string, tenantId: string) => {
  const cookieStore = cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, buildCookieOptions());
  cookieStore.set(TENANT_COOKIE, tenantId, buildCookieOptions());
};

export const clearVendorSession = () => {
  const cookieStore = cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(TENANT_COOKIE);
};
