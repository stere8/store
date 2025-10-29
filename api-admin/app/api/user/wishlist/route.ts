
import { dbConnect } from "@/lib/dbConnect";
import WishList from "@/models/WishList";
import WishListItem from "@/models/WishListItem";
import { WishListValidationSchema } from "@/types/schemas";
import { NextResponse } from "next/server";
import Productvariant from "@/models/Productvariant";
import Store from "@/models/Store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const _id = searchParams.get("_id");

  await dbConnect();
  try {
    if (_id) {
      const data = await WishList.findById(_id)
        .populate({
          path: "WishListItems",
          model: WishListItem,
          populate: [
            {
              path: "variant",
              model: Productvariant,
            },
            {
              path: "store",
              model: Store,
            },
            {
              path: "WishList",
              model: WishList,
            },
          ],
        })
        .lean();
      return NextResponse.json({ data }, { status: 200 });
    }
    const data = await WishList.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ err }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    // Get request values
    const body = await req.json();

    // Server side validation
    const validatedFields = WishListValidationSchema.safeParse(body);
    if (!validatedFields.success) {
      return Response.json(
        {
          message: "validation error",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 200 }
      );
    }

    // Save data to db
    const WishListData = await new WishList({
      user_id: body.user_id,
      subTotal: body.subTotal,
    }).save();

    //create each WishList item
    // Save data to db
    for (let index = 0; index < body.WishListItems.length; index++) {
      const element = body.WishListItems[index];
      const WishListItemData = await new WishListItem({
        WishList: WishListData._id,
        variant: element.variant,
        store: element.store,
        qty: element.qty,
        productName: element.productName,
        productImage: element.productImage,
      }).save();
      // Add sub product id to product
      if (WishListItemData) {
        const newData = {
          _id: WishListItemData._id,
        };

        await WishList.findByIdAndUpdate(WishListData._id, {
          $push: { WishListItems: newData },
        });
      } else {
        return NextResponse.json(
          { message: "Error.", WishListItemData, success: false },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { message: "New WishList created.", data: WishListData, success: true },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ err }, { status: 500 });
  }
}
