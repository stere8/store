import type { UserResource } from "@clerk/types";
import { apiClient } from "./epoc-api";

export const AUTH_RESUME_STORAGE_KEY = "front-store.customer-auth-resume";

export type ReservationDraft = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNote: string;
};

export type AuthResumeState =
  | {
      action: "checkout";
      returnPath: string;
    }
  | {
      action: "reservation";
      returnPath: string;
      reservationDraft: ReservationDraft;
    };

type CustomerAuthUser = Pick<
  UserResource,
  | "id"
  | "fullName"
  | "firstName"
  | "lastName"
  | "username"
  | "primaryEmailAddress"
  | "primaryPhoneNumber"
  | "phoneNumbers"
>;

export const buildFallbackPhoneNumber = (seed: string) => {
  const digits = seed.replace(/\D/g, "");
  return `+250${digits.slice(0, 9).padEnd(9, "0")}`;
};

export const getCustomerPhoneNumber = (
  user: CustomerAuthUser | null | undefined
) => {
  if (user?.primaryPhoneNumber?.phoneNumber) {
    return user.primaryPhoneNumber.phoneNumber;
  }

  if (user?.phoneNumbers?.[0]?.phoneNumber) {
    return user.phoneNumbers[0].phoneNumber;
  }

  return buildFallbackPhoneNumber(
    user?.id ||
      user?.primaryEmailAddress?.emailAddress ||
      user?.username ||
      "000000000"
  );
};

export const getCustomerFullName = (
  user: CustomerAuthUser | null | undefined
) => {
  if (user?.fullName?.trim()) {
    return user.fullName.trim();
  }

  const composedName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (composedName) {
    return composedName;
  }

  return (
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    user?.id ||
    "Customer"
  );
};

export const buildCustomerPayload = (
  user: CustomerAuthUser | null | undefined
) => {
  if (!user) {
    return null;
  }

  return {
    username: user.id,
    fullName: getCustomerFullName(user),
    phoneNumber: getCustomerPhoneNumber(user),
    email: user.primaryEmailAddress?.emailAddress || null,
    preferredLanguage: "en",
  };
};

export const upsertCustomerFromUser = async (
  user: CustomerAuthUser | null | undefined
) => {
  const payload = buildCustomerPayload(user);

  if (!payload) {
    return { id: "" };
  }

  const response = await apiClient.post("/api/customers", payload);
  return response.data;
};

export const normalizeInternalReturnPath = (
  candidate: string | null | undefined,
  fallback = "/cart"
) => {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  return candidate;
};

export const buildAuthRedirectUrl = (authPath: string, returnPath: string) => {
  const safeReturnPath = normalizeInternalReturnPath(returnPath);
  return `${authPath}?return_url=${encodeURIComponent(safeReturnPath)}`;
};

const canUseSessionStorage = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

export const readAuthResumeState = (): AuthResumeState | null => {
  if (!canUseSessionStorage()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(AUTH_RESUME_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as AuthResumeState;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.returnPath !== "string"
    ) {
      clearAuthResumeState();
      return null;
    }

    if (parsed.action === "checkout") {
      return {
        action: "checkout",
        returnPath: normalizeInternalReturnPath(parsed.returnPath),
      };
    }

    if (
      parsed.action === "reservation" &&
      parsed.reservationDraft &&
      typeof parsed.reservationDraft.customerName === "string" &&
      typeof parsed.reservationDraft.customerPhone === "string" &&
      typeof parsed.reservationDraft.customerEmail === "string" &&
      typeof parsed.reservationDraft.customerNote === "string"
    ) {
      return {
        action: "reservation",
        returnPath: normalizeInternalReturnPath(parsed.returnPath),
        reservationDraft: parsed.reservationDraft,
      };
    }
  } catch (error) {
    console.error("Failed to read stored auth resume state", error);
  }

  clearAuthResumeState();
  return null;
};

export const writeAuthResumeState = (state: AuthResumeState) => {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    AUTH_RESUME_STORAGE_KEY,
    JSON.stringify({
      ...state,
      returnPath: normalizeInternalReturnPath(state.returnPath),
    })
  );
};

export const clearAuthResumeState = () => {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_RESUME_STORAGE_KEY);
};
