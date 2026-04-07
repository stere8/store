import "server-only";

import { getEStoreApiBaseUrl, getEStoreTenantId } from "./estore-config";

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkPhoneNumber = {
  id: string;
  phone_number: string;
};

export type ClerkWebhookUser = {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  primary_phone_number_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  phone_numbers?: ClerkPhoneNumber[];
};

const buildFallbackPhoneNumber = (seed: string) => {
  const digits = seed.replace(/\D/g, "");
  return `+250${digits.slice(0, 9).padEnd(9, "0")}`;
};

const getPrimaryEmail = (user: ClerkWebhookUser) => {
  const primaryEmail = user.email_addresses?.find(
    (email) => email.id === user.primary_email_address_id
  );

  return primaryEmail?.email_address || user.email_addresses?.[0]?.email_address || null;
};

const getPrimaryPhoneNumber = (user: ClerkWebhookUser) => {
  const primaryPhone = user.phone_numbers?.find(
    (phone) => phone.id === user.primary_phone_number_id
  );

  return (
    primaryPhone?.phone_number ||
    user.phone_numbers?.[0]?.phone_number ||
    buildFallbackPhoneNumber(user.id || getPrimaryEmail(user) || user.username || "000000000")
  );
};

const getFullName = (user: ClerkWebhookUser) => {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || getPrimaryEmail(user) || user.username || user.id || "Customer";
};

const getApiHeaders = () => ({
  "Content-Type": "application/json",
  "X-Tenant-Id": getEStoreTenantId(),
});

const readApiError = async (response: Response) => {
  try {
    const payload = await response.json();
    return JSON.stringify(payload);
  } catch {
    return response.statusText;
  }
};

export async function upsertCustomerFromClerkUser(user: ClerkWebhookUser) {
  const response = await fetch(`${getEStoreApiBaseUrl()}/api/customers`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify({
      username: user.id,
      fullName: getFullName(user),
      phoneNumber: getPrimaryPhoneNumber(user),
      email: getPrimaryEmail(user),
      preferredLanguage: "en",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Customer upsert failed with ${response.status}: ${await readApiError(response)}`
    );
  }
}

export async function deleteCustomerByClerkUserId(userId: string) {
  const encodedUserId = encodeURIComponent(userId);
  const response = await fetch(
    `${getEStoreApiBaseUrl()}/api/customers/by-username/${encodedUserId}`,
    {
      method: "DELETE",
      headers: getApiHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Customer delete failed with ${response.status}: ${await readApiError(response)}`
    );
  }
}

