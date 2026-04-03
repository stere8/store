"use client";
import React from "react";
import Container from "@/components/custom/Container";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/custom/Loading";
import {
  TypeAddressModel,
  TypeCartModel,
  TypeDiscountModel,
  TypePmethodModel,
} from "@/types/models";
import Checkout from "../../../cart/Checkout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import useSWRMutation from "swr/mutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressFormData, CartItemForm } from "@/types/forms";
import { addressValidationSchema } from "@/types/schemas";
import { z } from "zod";
import { Input } from "@/components/custom/Input";
import { Separator } from "@/components/ui/separator";
import { countries } from "@/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronsUpDown,
  Loader2Icon,
  MoveDown,
  MoveUp,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ShippingStore from "./ShippingStore";
import Discount from "./Discount";
import Payments from "./Payments";
import getStripe from "@/lib/get-stripejs";
import { useRouter } from "next/navigation";

export default function Shipping({ cart }: { cart: TypeCartModel }) {
  const { userId, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const [openCountry, setOpenCountry] = React.useState(false);
  const [country, setCountry] = React.useState("rwanda");
  const [newCartItems, setNewCartItems] = useState<CartItemForm[]>(
    cart.cartItems.map((p) => {
      return {
        _id: p._id,
        cart: p.cart._id,
        shipping: "undefined",
        shippingAmount: 0,
        variant: p.variant._id,
        productName: p.productName,
        productImage: p.productImage,
        qty: p.qty,
        store: p.store._id,
      };
    })
  );
  const [selectedPayment, setSelectedPayment] = useState<TypePmethodModel>();
  const [selectedAddress, setSelectedAddress] = useState<TypeAddressModel>();

  const [total, setTotal] = useState(0);
  const [shipping, setShipping] = useState<number>(0);
  const [addresses, setAddresses] = useState<TypeAddressModel[]>([]);
  const [pmethods, setPmethods] = useState<TypePmethodModel[]>([]);
  const [coupon, setCoupon] = useState(0);
  const [discount, setDiscount] = useState<TypeDiscountModel>();
  const router = useRouter();

  //TODO: Create tax
  // const [tax, setTax] = useState(((14975 / 1000) * cart.subTotal) / 100);
  const tax = 0;
  useEffect(() => {
    setTotal(cart.subTotal + shipping - coupon + tax);
    const getAddresses = async () => {
      setLoading(true);
      const token = await getToken();
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/user/addresses", {
          params: {
            user_id: userId && userId,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setAddresses(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    const getPMethods = async () => {
      setLoading(true);
      await axios
        .get(process.env.NEXT_PUBLIC_API_URL + "/api/public/pmethods")
        .then((response) => {
          setPmethods(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getPMethods();
    getAddresses();
  }, [userId, shipping, coupon, discount, cart.subTotal, getToken]);

  const placeOrder = async () => {
    setLoading(true);
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const token = await getToken();
    const checkShipping =
      newCartItems && newCartItems.find((i) => i.shipping === "undefined");

    if (cart.cartItems.length > 8) {
      setLoading(false);
      return;
    }

    if (newCartItems === undefined || checkShipping) {
      toast({
        variant: "destructive",
        title: "OOps!",
        description: "Select shipping to continue",
      });
      setLoading(false);
      return;
    }

    if (!selectedPayment || !selectedAddress) {
      toast({
        variant: "destructive",
        title: "OOps!",
        description: "Select an address, payment to continue",
      });
      setLoading(false);
      return;
    }

    const data = {
      cartItems: newCartItems,
      subTotal: cart.subTotal,
      shipping: shipping,
      discount: coupon,
      tax: tax,
      total: total,
      user_id: cart.user_id,
      pmethod: selectedPayment?._id,
      address: selectedAddress._id,
    };

    await axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/api/user/orders", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        const data = response.data;
        toast({
          variant: "default",
          title: "Well done!",
          description: data.message,
        });

        const stripe = await getStripe();
        await stripe!.redirectToCheckout({
          // Make the id field from the Checkout Session creation API response
          // available to this file, so you can provide it as parameter here
          // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
          sessionId: data.id,
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // setLoading(false);
      });
  };

  // 2. Form method
  async function postRequest(url: string, { arg }: { arg: AddressFormData }) {
    const token = await getToken();
    return await axios
      .post(process.env.NEXT_PUBLIC_API_URL + url, arg, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        setAddresses([...addresses, response.data.data]);
        toast({
          variant: "default",
          title: "Well done",
          description: response.data.message,
        });
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {});
  }

  async function deleteRequest(
    url: string,
    { arg }: { arg: { _id: string | undefined } }
  ) {
    const token = await getToken();
    return await axios
      .delete(process.env.NEXT_PUBLIC_API_URL + url, {
        params: arg,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        const newAdd = addresses.filter((item) => item._id !== arg._id);
        setAddresses(newAdd);
        toast({
          variant: "default",
          title: "Well done",
          description: response.data.message,
        });
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {});
  }

  const { trigger: create, isMutating: isCreating } = useSWRMutation(
    "/api/user/addresses",
    postRequest /* options */
  );

  const { trigger: updating, isMutating: isDeleting } = useSWRMutation(
    "/api/user/addresses",
    deleteRequest
  );

  const form = useForm<z.infer<typeof addressValidationSchema>>({
    resolver: zodResolver(addressValidationSchema),
    defaultValues: {
      firstName: "yourfirstname",
      lastName: "yourlastname",
      email: "youremailhere@gmail.com",
      address: "Quebec Longueuil 1023 Bd Taschereau",
      country: country,
      city: "Kigali",
      state: "Kigali",
      phone: "(450) 646-5632",
      zipCode: "J4K 2X5",
      user_id: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof addressValidationSchema>) => {
    const data = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      address: values.address,
      country: country,
      city: values.city,
      state: values.state,
      phone: values.phone,
      zipCode: values.zipCode,
      user_id: userId,
    };

    if (addresses.length > 6) {
      toast({
        variant: "default",
        title: "OOPs!",
        description: "addresses limit reached! Delete one",
      });
      return;
    }
    await create(data);
  };

  return (
    <section className="my-10">
      {loading || (isDeleting && <Loading loading={loading} />)}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 flex flex-col relative overflow-x-auto flex-1 w-full">
            <h3 className="font-bold">Add Delivery Address</h3>
            <Separator className="my-2" />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex gap-4 flex-wrap py-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input className="lowercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input className="lowercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  <Popover open={openCountry} onOpenChange={setOpenCountry}>
                    <PopoverTrigger
                      asChild
                      value={country}
                      defaultValue={country}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCountry}
                        className="justify-between mt-8"
                      >
                        <div className="flex gap-2 justify-start">
                          {country ? country : "Select country"}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[420px] p-0" side="bottom">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {countries &&
                              countries.map((item) => (
                                <CommandItem
                                  key={item.name}
                                  value={item.name}
                                  onSelect={() => {
                                    setCountry(item.name);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      country?.includes(item.name)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />

                                  <span className="ms-2 capitalize">
                                    {item.name}
                                  </span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input className="lowercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input className="lowercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input className="lowercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip code</FormLabel>
                        <FormControl>
                          <Input className="lowercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input className="lowercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          className="rounded-none"
                          cols={140}
                          rows={3}
                          placeholder=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  variant="default"
                  size="lg"
                  disabled={isCreating}
                  type="submit"
                  className="rounded-none"
                >
                  <Loader2Icon
                    className={cn(
                      "hidden mr-2 h-6 w-6 animate-spin ",
                      isCreating && "block"
                    )}
                  />
                  CREATE
                </Button>
              </form>
            </Form>
            <div className="flex  flex-col my-4">
              <h3 className="font-bold">Select a delivery address</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4 flex-wrap ">
                {addresses &&
                  addresses.map((item: TypeAddressModel) => (
                    <Card
                      key={item._id}
                      onClick={() => setSelectedAddress(item)}
                      className={cn(
                        "rounded-none  p-2 border-2 cursor-pointer hover:border-secondary-700 group",
                        selectedAddress?._id === item._id &&
                          "border-secondary-700"
                      )}
                    >
                      <CardContent className="flex items-center  gap-4 h-full py-4">
                        <Check
                          className={cn(
                            "text-gray-300 group-hover:text-secondary-700",
                            selectedAddress?._id === item._id &&
                              "text-secondary-700"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="text-body-sm-400 text-gray-700">
                            {item.country},{item.city},{item.state},
                          </span>
                          <p>{item.address.substring(0, 100)}</p>
                        </div>
                        <Button
                          onClick={() => updating({ _id: item._id })}
                          variant="outline"
                          className="ms-auto border-none"
                        >
                          <Trash className=" text-primary-500 hidden group-hover:block " />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            <ShippingStore
              shipping={shipping}
              cart={cart}
              setShipping={setShipping}
              setNewCartItems={setNewCartItems}
              newCartItems={newCartItems}
            />
            <Payments
              pmethods={pmethods}
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Discount
              setCoupon={setCoupon}
              setDiscount={setDiscount}
              subtotal={cart.subTotal}
              setLoading={setLoading}
            />
            <Checkout
              cart={cart}
              tax={tax}
              className=""
              shipping={shipping}
              coupon={coupon}
              loading={loading}
              subtotal={cart.subTotal}
              total={total}
              placeOrder={placeOrder}
            />
            <div className="flex gap-4">
              <div className="flex items-center text-body-sm-400 ">
                <MoveDown className="text-green-500" size={14} />
                Decrease amount
              </div>
              <div className="flex items-center text-body-sm-400 ">
                <MoveUp size={14} className="text-red-500" />
                Increase amount
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
