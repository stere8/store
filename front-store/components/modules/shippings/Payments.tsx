import React from "react";
import { TypePmethodModel } from "@/types/models";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function Payments({
  pmethods,
  selectedPayment,
  setSelectedPayment,
}: {
  pmethods?: TypePmethodModel[];
  selectedPayment?: TypePmethodModel;
  setSelectedPayment: (v: TypePmethodModel) => void;
}) {
  return (
    <>
      <h3 className="font-bold">Select payment</h3>
      <Separator className="my-2" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4 flex-wrap ">
        {pmethods &&
          pmethods.map((item: TypePmethodModel) => (
            <Card key={item._id}
              onClick={() => setSelectedPayment(item)}
              className={cn(
                "rounded-none  p-2 border-2 cursor-pointer hover:border-secondary-700 group",
                selectedPayment?._id === item._id && "border-secondary-700"
              )}
            >
              <CardContent className="flex items-center  gap-4 h-full py-4">
                <Check
                  size={80}
                  className={cn(
                    "text-gray-300 group-hover:text-secondary-700",
                    selectedPayment?._id === item._id && "text-secondary-900"
                  )}
                />
                <div className="flex flex-col gap-4">
                  <span className="text-body-sm-400 text-gray-700">
                    {item.description.substring(0, 200)}
                  </span>
                  <p className="capitalize">{item.name.substring(0, 100)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </>
  );
}
