import React from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import useSWRMutation from "swr/mutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/custom/Input";
import { discountValidationSchema } from "@/types/schemas";
import { DiscountFormData } from "@/types/forms";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Loading from "@/components/custom/Loading";
import { TypeDiscountModel } from "@/types/models";

export default function Discount({
  setCoupon,
  setDiscount,
  subtotal,
  setLoading,
}: {
  setCoupon: (v: number) => void;
  setDiscount: (v: TypeDiscountModel) => void;
  setLoading: (v: boolean) => void;
  subtotal: number;
}) {
  const { getToken } = useAuth();

  async function postRequest(url: string, { arg }: { arg: DiscountFormData }) {
    setLoading(true);
    const token = await getToken();
    return await axios
      .post(process.env.NEXT_PUBLIC_API_URL + url, arg, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        const data = response.data;

        if (data.success === true) {
          setCoupon((response.data.data.discount * subtotal) / 100);
          setDiscount(data.data);
          toast({
            variant: "default",
            title: "Well done",
            description: data.message,
          });
        } else {
          toast({
            variant: "default",
            title: "OOps!",
            description: data.message,
          });
        }
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const { trigger: create, isMutating: isCreating } = useSWRMutation(
    "/api/user/discounts",
    postRequest
  );

  const form = useForm<z.infer<typeof discountValidationSchema>>({
    resolver: zodResolver(discountValidationSchema),
    defaultValues: {
      discount: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof discountValidationSchema>) => {
    const data = {
      discount: values.discount,
    };

    await create(data);
  };
  return (
    <div>
      {isCreating && <Loading loading={true} />}
      <h3>Discount</h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex gap-4 flex-wrap py-8"
        >
          <div className="w-full space-y-2">
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <Input className="uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              variant="default"
              className="rounded-none"
              type="submit"
              disabled={isCreating}
            >
              APPLY
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
