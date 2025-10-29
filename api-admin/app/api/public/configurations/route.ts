import { dbConnect } from "@/lib/dbConnect";
import Configuration from "@/models/Configuration";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  try {
    const data = await Configuration.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ data: data[0] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ err }, { status: 500 });
  }
}
