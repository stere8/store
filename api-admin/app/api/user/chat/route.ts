import { dbConnect } from "@/lib/dbConnect";
import ChatMessage from "@/models/ChatMessage";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");
  const userId = searchParams.get("userId");
  const productId = searchParams.get("productId");

  await dbConnect();

  try {
    if (!storeId || !userId || !productId) {
      return NextResponse.json(
        { message: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const messages = await ChatMessage.find({
      store: storeId,
      userId,
      productId,
    })
      .populate("store", "name email")
      .populate("productId", "name images")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ messages, success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err, success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { storeId, userId, productId, sender, content } = body;

    if (!storeId || !userId || !productId || !sender || !content) {
      return NextResponse.json(
        { message: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    // Save message
    const chatMessage = await new ChatMessage({
      store: storeId,
      userId,
      productId,
      sender,
      content,
    }).save();

    return NextResponse.json(
      { message: "Message saved successfully", data: chatMessage, success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err, success: false }, { status: 500 });
  }
}
