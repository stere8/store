import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/dbConnect";
import ProductVariant from "@/models/Productvariant";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
});

export async function POST(req: Request) {
  try {
    console.log("➡️  /api/checkout/stripe-session called");
    const body = await req.json();
    console.log("   Request body:", body);

    const { variantId, quantity } = body;
    if (!variantId || !quantity) {
      console.warn("   Missing variantId or quantity");
      return NextResponse.json(
        { error: "Missing variantId or quantity" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log("   DB connected, fetching variant", variantId);
    const variant = await ProductVariant.findById(variantId)
      .populate("product")
      .lean();
    console.log("   Fetched variant:", variant);

    if (!variant) {
      console.warn("   Variant not found");
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    // ──────────────────────────────────────────────────────────────
    // 1) Determine productName (must be before discount logic)
    const productName = variant.product?.name || variant.name || "Product";
    console.log("   Using productName:", productName);

    // 2) Compute discounted price
    //    variant.discount is a percentage (e.g. 10 for 10%)
    const discountFactor = 1 - (variant.discount ?? 0) / 100;
    const discountedPrice = variant.price * discountFactor;
    console.log("   Discounted price:", discountedPrice);

    // 3) Determine unitAmount for Stripe, accounting for zero‑decimal currencies
    const zeroDecimalCurrencies = new Set([
      "bif","clp","djf","gnf","jpy","kmf","krw","mga","pyg","rwf",
      "vnd","vuv","xaf","xof","xpf"
    ]);
    const currency = "rwf"; // or read from env if dynamic

    const unitAmount = zeroDecimalCurrencies.has(currency)
      ? Math.round(discountedPrice)
      : Math.round(discountedPrice * 100);
    console.log("   Charging unitAmount:", unitAmount, currency);
    // ──────────────────────────────────────────────────────────────

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: productName,
              images:
                variant.colorImages?.length > 0
                  ? [variant.colorImages[0]?.url]
                  : [],
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/cancel`,
    });

    console.log("   Stripe session created:", session.id);
    return NextResponse.json({ id: session.id });
  } catch (error: any) {
    console.error("❌ Stripe session error:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe session", detail: error.message },
      { status: 500 }
    );
  }
}