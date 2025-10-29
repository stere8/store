import { dbConnect } from "@/lib/dbConnect";
import Brand from "@/models/Brand";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get("_id");

    if (_id) {
      if (!isValidObjectId(_id)) {
        return NextResponse.json(
          { message: "This Id is not valid", success: false },
          { status: 404 }
        );
      }
      const data = await Brand.findById(_id).lean();
      return NextResponse.json({ data }, { status: 200 });
    }

    const data = await Brand.find({
      $and: [
        {
          status: "publish",
        },
      ],
    }).lean();
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ err }, { status: 500 });
  }
}
