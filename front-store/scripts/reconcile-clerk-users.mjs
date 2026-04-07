import fs from "node:fs";
import path from "node:path";
import { createClerkClient } from "@clerk/backend";

const rootDir = process.cwd();

function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const apiBaseUrl =
  process.env.NEXT_PUBLIC_ESTORE_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API?.trim() ||
  "http://localhost:5000";

const tenantId =
  process.env.NEXT_PUBLIC_ESTORE_TENANT_ID?.trim() || "kigali-city-mall";

const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim();

if (!clerkSecretKey) {
  throw new Error("CLERK_SECRET_KEY is required.");
}

const clerkClient = createClerkClient({
  secretKey: clerkSecretKey,
});

const buildFallbackPhoneNumber = (seed) => {
  const digits = String(seed || "").replace(/\D/g, "");
  return `+250${digits.slice(0, 9).padEnd(9, "0")}`;
};

const getPrimaryEmail = (user) => {
  const primary = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  );

  return primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
};

const getPrimaryPhoneNumber = (user) => {
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

const getFullName = (user) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || getPrimaryEmail(user) || user.username || user.id || "Customer";
};

async function upsertCustomer(user) {
  const response = await fetch(`${apiBaseUrl}/api/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
    },
    body: JSON.stringify({
      username: user.id,
      fullName: getFullName(user),
      phoneNumber: getPrimaryPhoneNumber(user),
      email: getPrimaryEmail(user),
      preferredLanguage: "en",
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Upsert failed for ${user.id}: ${response.status} ${details}`);
  }
}

async function main() {
  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;
  let processed = 0;

  do {
    const page = await clerkClient.users.getUserList({
      limit: pageSize,
      offset,
      orderBy: "-created_at",
    });

    totalCount = page.totalCount;

    for (const user of page.data) {
      await upsertCustomer(user);
      processed += 1;
      process.stdout.write(`Synced ${processed}/${totalCount}: ${user.id}\n`);
    }

    offset += page.data.length;
  } while (offset < totalCount);

  process.stdout.write(`Completed Clerk reconciliation for ${processed} users.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

