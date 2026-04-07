import type { WebhookEvent } from "@clerk/backend";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  deleteCustomerByClerkUserId,
  type ClerkWebhookUser,
  upsertCustomerFromClerkUser,
} from "@/lib/server-customer-sync";

const getRequiredHeader = (request: Request, key: string) => request.headers.get(key);

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const svixId = getRequiredHeader(request, "svix-id");
  const svixTimestamp = getRequiredHeader(request, "svix-timestamp");
  const svixSignature = getRequiredHeader(request, "svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix verification headers." },
      { status: 400 }
    );
  }

  const payload = await request.text();

  let event: WebhookEvent;

  try {
    event = new Webhook(webhookSecret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Invalid Clerk webhook signature", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await upsertCustomerFromClerkUser(event.data as ClerkWebhookUser);
        break;
      case "user.deleted":
        if (event.data.id) {
          await deleteCustomerByClerkUserId(event.data.id);
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Failed to process Clerk webhook", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

