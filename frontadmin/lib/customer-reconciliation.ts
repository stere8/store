import "server-only";

import { createHash } from "node:crypto";
import {
  listCustomerIdentityIgnores,
  listCustomers,
  listReservations,
  type CustomerReconciliationIssueType,
  type EStoreCustomer,
} from "@/lib/estore-api";
import { listClerkUsers, type ClerkDirectoryUser } from "@/lib/clerk-directory";

export type CustomerIdentityField =
  | "username"
  | "fullName"
  | "email"
  | "phoneNumber";

export type CustomerIdentityFieldMismatch = {
  field: CustomerIdentityField;
  clerkValue: string | null;
  dbValue: string | null;
};

export type CustomerReconciliationRecord = {
  issueType: CustomerReconciliationIssueType;
  subjectKey: string;
  fingerprint: string;
  ignored: boolean;
  reservationCount: number;
  clerkUser?: ClerkDirectoryUser;
  customer?: EStoreCustomer;
  matchSource?: "username" | "email" | "phone";
  mismatches: CustomerIdentityFieldMismatch[];
};

export type CustomerReconciliationBucket = {
  id: CustomerReconciliationIssueType;
  label: string;
  description: string;
  items: CustomerReconciliationRecord[];
};

export type CustomerReconciliationSnapshot = {
  query: string;
  clerkUsersCount: number;
  dbCustomersCount: number;
  reservationsCount: number;
  activeCount: number;
  ignoredCount: number;
  buckets: CustomerReconciliationBucket[];
  ignoredItems: CustomerReconciliationRecord[];
};

const normalizeText = (value?: string | null) => value?.trim() || "";

const normalizeLower = (value?: string | null) => normalizeText(value).toLowerCase();

const toNullable = (value?: string | null) => {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
};

const buildFingerprint = (
  issueType: CustomerReconciliationIssueType,
  subjectKey: string,
  payload: unknown
) =>
  createHash("sha256")
    .update(JSON.stringify({ issueType, subjectKey, payload }))
    .digest("hex");

const matchesIdentitySearch = (
  record: CustomerReconciliationRecord,
  query: string
) => {
  const normalizedQuery = normalizeLower(query);
  if (!normalizedQuery) {
    return true;
  }

  const values = [
    record.issueType,
    record.matchSource,
    record.clerkUser?.id,
    record.clerkUser?.clerkUsername,
    record.clerkUser?.fullName,
    record.clerkUser?.email,
    record.clerkUser?.phoneNumber,
    record.customer?.username,
    record.customer?.fullName,
    record.customer?.email,
    record.customer?.phoneNumber,
    ...record.mismatches.flatMap((mismatch) => [
      mismatch.field,
      mismatch.clerkValue,
      mismatch.dbValue,
    ]),
  ]
    .map((value) => normalizeLower(value))
    .filter(Boolean);

  return values.some((value) => value.includes(normalizedQuery));
};

const compareIdentityFields = (
  clerkUser: ClerkDirectoryUser,
  customer: EStoreCustomer
) => {
  const mismatches: CustomerIdentityFieldMismatch[] = [];

  if (normalizeText(customer.username) !== normalizeText(clerkUser.id)) {
    mismatches.push({
      field: "username",
      clerkValue: clerkUser.id,
      dbValue: toNullable(customer.username),
    });
  }

  if (normalizeText(customer.fullName) !== normalizeText(clerkUser.fullName)) {
    mismatches.push({
      field: "fullName",
      clerkValue: toNullable(clerkUser.fullName),
      dbValue: toNullable(customer.fullName),
    });
  }

  if (normalizeLower(customer.email) !== normalizeLower(clerkUser.email)) {
    mismatches.push({
      field: "email",
      clerkValue: toNullable(clerkUser.email),
      dbValue: toNullable(customer.email),
    });
  }

  if (normalizeText(customer.phoneNumber) !== normalizeText(clerkUser.phoneNumber)) {
    mismatches.push({
      field: "phoneNumber",
      clerkValue: toNullable(clerkUser.phoneNumber),
      dbValue: toNullable(customer.phoneNumber),
    });
  }

  return mismatches;
};

const sortRecords = (left: CustomerReconciliationRecord, right: CustomerReconciliationRecord) => {
  const leftLabel =
    left.clerkUser?.fullName ||
    left.customer?.fullName ||
    left.clerkUser?.id ||
    left.customer?.username ||
    "";
  const rightLabel =
    right.clerkUser?.fullName ||
    right.customer?.fullName ||
    right.clerkUser?.id ||
    right.customer?.username ||
    "";

  return leftLabel.localeCompare(rightLabel);
};

export async function getCustomerReconciliationSnapshot(query = "") {
  const [clerkUsers, customers, ignores, reservations] = await Promise.all([
    listClerkUsers(),
    listCustomers(undefined, { includeArchived: false }),
    listCustomerIdentityIgnores(),
    listReservations(),
  ]);

  const reservationsByCustomerId = new Map<string, number>();
  reservations.forEach((reservation) => {
    reservationsByCustomerId.set(
      reservation.customerId,
      (reservationsByCustomerId.get(reservation.customerId) || 0) + 1
    );
  });

  const ignoreFingerprints = new Map<string, string>();
  ignores.forEach((ignore) => {
    ignoreFingerprints.set(`${ignore.issueType}:${ignore.subjectKey}`, ignore.fingerprint);
  });

  const customersByUsername = new Map(customers.map((customer) => [customer.username, customer]));
  const customersByEmail = new Map(
    customers
      .filter((customer) => normalizeLower(customer.email))
      .map((customer) => [normalizeLower(customer.email), customer])
  );
  const customersByPhone = new Map(
    customers
      .filter((customer) => normalizeText(customer.phoneNumber))
      .map((customer) => [normalizeText(customer.phoneNumber), customer])
  );

  const matchedCustomerIds = new Set<string>();
  const records: CustomerReconciliationRecord[] = [];

  for (const clerkUser of clerkUsers) {
    let customer = customersByUsername.get(clerkUser.id);
    let matchSource: CustomerReconciliationRecord["matchSource"] | undefined = customer
      ? "username"
      : undefined;

    if (!customer && clerkUser.email) {
      customer = customersByEmail.get(normalizeLower(clerkUser.email));
      matchSource = customer ? "email" : undefined;
    }

    if (!customer && clerkUser.phoneNumber) {
      customer = customersByPhone.get(normalizeText(clerkUser.phoneNumber));
      matchSource = customer ? "phone" : undefined;
    }

    if (customer && matchedCustomerIds.has(customer.id)) {
      customer = undefined;
      matchSource = undefined;
    }

    if (!customer) {
      const subjectKey = `clerk:${clerkUser.id}`;
      const fingerprint = buildFingerprint("clerk-only", subjectKey, clerkUser);
      records.push({
        issueType: "clerk-only",
        subjectKey,
        fingerprint,
        ignored:
          ignoreFingerprints.get(`clerk-only:${subjectKey}`) === fingerprint,
        reservationCount: 0,
        clerkUser,
        mismatches: [],
      });
      continue;
    }

    matchedCustomerIds.add(customer.id);
    const mismatches = compareIdentityFields(clerkUser, customer);

    if (mismatches.length === 0) {
      continue;
    }

    const subjectKey = `customer:${customer.id}`;
    const fingerprint = buildFingerprint("mismatched", subjectKey, {
      clerkUser,
      customer,
      mismatches,
    });

    records.push({
      issueType: "mismatched",
      subjectKey,
      fingerprint,
      ignored:
        ignoreFingerprints.get(`mismatched:${subjectKey}`) === fingerprint,
      reservationCount: reservationsByCustomerId.get(customer.id) || 0,
      clerkUser,
      customer,
      matchSource,
      mismatches,
    });
  }

  for (const customer of customers) {
    if (matchedCustomerIds.has(customer.id)) {
      continue;
    }

    const subjectKey = `customer:${customer.id}`;
    const fingerprint = buildFingerprint("db-only", subjectKey, customer);

    records.push({
      issueType: "db-only",
      subjectKey,
      fingerprint,
      ignored: ignoreFingerprints.get(`db-only:${subjectKey}`) === fingerprint,
      reservationCount: reservationsByCustomerId.get(customer.id) || 0,
      customer,
      mismatches: [],
    });
  }

  const filteredRecords = records
    .filter((record) => matchesIdentitySearch(record, query))
    .sort(sortRecords);

  const activeRecords = filteredRecords.filter((record) => !record.ignored);
  const ignoredItems = filteredRecords.filter((record) => record.ignored);

  const buckets: CustomerReconciliationBucket[] = [
    {
      id: "mismatched",
      label: "Both but mismatched",
      description:
        "A Clerk user and local customer record were matched, but the identity fields differ. Clerk should overwrite the local record.",
      items: activeRecords.filter((record) => record.issueType === "mismatched"),
    },
    {
      id: "clerk-only",
      label: "Clerk only",
      description:
        "The user exists in Clerk but has no active customer record in the local database yet.",
      items: activeRecords.filter((record) => record.issueType === "clerk-only"),
    },
    {
      id: "db-only",
      label: "DB only",
      description:
        "The local record exists without a matching Clerk identity. Treat these as orphaned or history-only records.",
      items: activeRecords.filter((record) => record.issueType === "db-only"),
    },
  ];

  return {
    query,
    clerkUsersCount: clerkUsers.length,
    dbCustomersCount: customers.length,
    reservationsCount: reservations.length,
    activeCount: activeRecords.length,
    ignoredCount: ignoredItems.length,
    buckets,
    ignoredItems,
  } satisfies CustomerReconciliationSnapshot;
}
