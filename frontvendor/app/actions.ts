"use server";

import { redirect } from "next/navigation";
import {
  apiRequest,
  getDefaultTenantId,
  VendorAuthResponse,
} from "@/lib/api";
import {
  clearVendorSession,
  writeVendorSession,
} from "@/lib/vendor-session";

const asString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const buildAuthRedirect = (
  path: string,
  tenantId: string,
  key?: "error" | "success",
  message?: string
) => {
  const search = new URLSearchParams();

  if (tenantId) {
    search.set("tenantId", tenantId);
  }

  if (key && message) {
    search.set(key, message);
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
};

export async function loginVendorAction(formData: FormData) {
  const tenantId = asString(formData.get("tenantId")) || getDefaultTenantId();

  try {
    const response = await apiRequest<VendorAuthResponse>(
      "/api/vendor-auth/login",
      tenantId,
      {
        method: "POST",
        body: JSON.stringify({
          email: asString(formData.get("email")),
          password: asString(formData.get("password")),
        }),
      }
    );

    writeVendorSession(response.accessToken, tenantId);
    redirect("/dashboard");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sign in to the vendor portal.";
    redirect(buildAuthRedirect("/login", tenantId, "error", message));
  }
}

export async function registerVendorAction(formData: FormData) {
  const tenantId = asString(formData.get("tenantId")) || getDefaultTenantId();

  try {
    const response = await apiRequest<VendorAuthResponse>(
      "/api/vendor-auth/register",
      tenantId,
      {
        method: "POST",
        body: JSON.stringify({
          registrationCode: asString(formData.get("registrationCode")),
          email: asString(formData.get("email")),
          password: asString(formData.get("password")),
        }),
      }
    );

    writeVendorSession(response.accessToken, tenantId);
    redirect("/dashboard");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to activate the vendor account with that code.";
    redirect(buildAuthRedirect("/register", tenantId, "error", message));
  }
}

export async function logoutVendorAction() {
  clearVendorSession();
  redirect(buildAuthRedirect("/login", getDefaultTenantId(), "success", "Signed out."));
}
