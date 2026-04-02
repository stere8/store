import {
  TypeCartItemModel,
  TypeCartModel,
  TypeShippingModel,
} from "@/types/models";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartItemForm } from "@/types/forms";
import { Separator } from "@/components/ui/separator";

export default function ShippingStore({
  cart,
  shipping,
  setShipping,
  setNewCartItems,
  newCartItems,
}: {
  cart: TypeCartModel;
  shipping: number;
  setShipping: (v: number) => void;
  setNewCartItems: (v: CartItemForm[]) => void;
  newCartItems?: CartItemForm[];
}) {
  const [loading, setLoading] = useState(false);
  const [shippings, setShippings] = useState<TypeShippingModel[]>([]);

  const handleCartUpdate = (cartItemId: string, shippingId: string) => {
    const data =
      newCartItems &&
      newCartItems.map((p) => {
        const ship = shippings.find((s) => s._id === shippingId);
        if (p._id === cartItemId) {
          return {
            _id: p._id,
            cart: p.cart,
            shipping: shippingId,
            shippingAmount: ship && ship?.fees + ship?.fixed_amount,
            variant: p.variant,
            productName: p.productName,
            productImage: p.productImage,
            qty: p.qty,
            store: p.store,
          };
        }
        return p;
      });
    if (data) {
      setNewCartItems(data);
    }
  };

  useEffect(() => {
    const getShippings = async () => {
      setLoading(true);
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/public/shippings")
        .then((response) => {
          setShippings(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getShippings();

    const totalshipping =
      newCartItems &&
      newCartItems.length > 0 &&
      newCartItems.reduce(
        (total: number, currentValue: CartItemForm) =>
          total +
          (currentValue.shippingAmount ? currentValue?.shippingAmount : 0),
        0
      );
    setShipping(totalshipping ? totalshipping : 0);
  }, [newCartItems, shipping,setShipping]);

  return (
    <div className="my-8">
      <h3 className="font-bold">Select shipping</h3>
      <Separator className="my-4" />
      <small>
        Shipping depends on each seller, make sure to select a shipping
        available for your product. if a product do not have a shipping in your
        country delete this product from you cart.
      </small>

      <div className="py-4 overflow-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 cursor-move overflow-auto">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 ">
                Product
              </th>
              <th scope="col" className="px-6 py-3">
                Shipping
              </th>
              {/* <th scope="col" className="px-6 py-3">
                Delete if shipping not found
              </th> */}
            </tr>
          </thead>
          <tbody>
            {cart.cartItems.length > 0 &&
              cart.cartItems.map((item: TypeCartItemModel) => (
                <tr
                  key={item._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td
                    key={item._id}
                    scope="row"
                    className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <Image
                        src={item.productImage}
                        width="200"
                        height={0}
                        alt="prod"
                        className="h-20 w-auto object-contain"
                      />
                      <div className="hidden lg:flex flex-col ">
                        <span className="capitalize">
                          {item.productName.substring(0, 30)}
                        </span>
                        <span className="font-bold">
                          {item.variant.name.substring(0, 40)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Select
                      disabled={loading}
                      onValueChange={(e) => handleCartUpdate(item._id, e)}
                    >
                      <SelectTrigger className="w-[360px]">
                        <SelectValue placeholder="select a shipping" />
                      </SelectTrigger>
                      <SelectContent className="w-[360px]">
                        {shippings &&
                          shippings
                            .filter(
                              (i) => i.store && i.store._id == item.store._id
                            )
                            .map((p) => (
                              <SelectItem value={p._id} key={p._id}>
                                <div className="grid grid-cols-3 gap-2 place-content-center">
                                  <span className="font-bold">{p.name}</span>
                                  <span> ${p.fees + p.fixed_amount}</span>
                                  <span> {p.delay} days</span>
                                </div>
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* New features */}
                  {/* <td>
                    <Button
                      onClick={() => deleteItem(item._id)}
                      variant="outline"
                      className="ms-auto border-none"
                    >
                      <Trash className=" text-primary-500 " />
                    </Button>
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
