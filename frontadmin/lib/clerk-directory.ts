import "server-only";

import { createClerkClient } from "@clerk/backend";

type ClerkEmailAddress = {
  id: string;
  emailAddress: string;
};

type ClerkPhoneNumber = {
  id: string;
  phoneNumber: string;
};

type ClerkUserRecord = {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddressId: string | null;
  primaryPhoneNumberId: string | null;
  emailAddresses: ClerkEmailAddress[];
  phoneNumbers: ClerkPhoneNumber[];
  createdAt?: number | null;
  lastSignInAt?: number | null;
};

export type ClerkDirectoryUser = {
  id: string;
  clerkUsername: string | null;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  createdAt: string | null;
  lastSignInAt: string | null;
};

const getClerkSecretKey = () => {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is required for frontadmin reconciliation.");
  }

  return secretKey;
};

const getClerkClient = () =>
  createClerkClient({
    secretKey: getClerkSecretKey(),
  });

const buildFallbackPhoneNumber = (seed: string) => {
  const digits = seed.replace(/\D/g, "");
  return `+250${digits.slice(0, 9).padEnd(9, "0")}`;
};

const getPrimaryEmail = (user: ClerkUserRecord) => {
  const primary = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  );

  return primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
};

const getPrimaryPhoneNumber = (user: ClerkUserRecord) => {
  const primary = user.phoneNumbers.find(
    (phone) => phone.id === user.primaryPhoneNumberId
  );

  return (
    primary?.phoneNumber ||
    user.phoneNumbers[0]?.phoneNumber ||
    buildFallbackPhoneNumber(
      user.id || getPrimaryEmail(user) || user.username || "000000000"
    )
  );
};

const getFullName = (user: ClerkUserRecord) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return fullName || getPrimaryEmail(user) || user.username || user.id || "Customer";
};

const toIsoString = (timestamp?: number | null) =>
  timestamp ? new Date(timestamp).toISOString() : null;

const normalizeClerkUser = (user: ClerkUserRecord): ClerkDirectoryUser => ({
  id: user.id,
  clerkUsername: user.username,
  fullName: getFullName(user),
  email: getPrimaryEmail(user),
  phoneNumber: getPrimaryPhoneNumber(user),
  createdAt: toIsoString(user.createdAt),
  lastSignInAt: toIsoString(user.lastSignInAt),
});

export async function listClerkUsers() {
  const clerkClient = getClerkClient();
  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;
  const users: ClerkDirectoryUser[] = [];

  do {
    const page = await clerkClient.users.getUserList({
      limit: pageSize,
      offset,
      orderBy: "-created_at",
    });

    totalCount = page.totalCount;
    users.push(...page.data.map((user) => normalizeClerkUser(user as ClerkUserRecord)));
    offset += page.data.length;
  } while (offset < totalCount);

  return users;
}

export async function deleteClerkUser(userId: string) {
  const clerkClient = getClerkClient();
  await clerkClient.users.deleteUser(userId);
}
