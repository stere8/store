import { dbConnect } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Token from "@/models/Token";

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get("template");

    if (!template) {
      return NextResponse.json(
        { message: "template is empty" },
        { status: 200 }
      );
    }

    const data = await Token.find(
      {
        $and: [
          {
            template: template,
          },
          {
            status: "publish",
          },
        ],
      },
      { token: 1 }
    ).lean();
    if (!data) {
      return NextResponse.json({ message: "token not found" }, { status: 200 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ err }, { status: 500 });
  }
}
